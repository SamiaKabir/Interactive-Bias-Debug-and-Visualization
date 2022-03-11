from ast import Global
from flask import Flask, send_from_directory, flash, redirect, render_template, request, session, abort, send_from_directory, send_file, jsonify
import json
import time
from numpy import NaN
import pandas as pd
import gensim
import gensim.downloader
from gensim import models, corpora
import numpy as np
from sklearn.decomposition import LatentDirichletAllocation
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfVectorizer
from nltk.tokenize import RegexpTokenizer
from flask_restful import Api, Resource, reqparse
# from flask_cors import CORS  # comment this on deployment
# from api.ApiHandler import ApiHandler


# load data
fields = ['title']
headlines = pd.read_csv('static/assets/data/articles1.csv',
                        skipinitialspace=True, usecols=fields)


# # Topic Modeling with LDA

# Trim the dataset
news = headlines.sample(frac=0.6, random_state=423)

docs = []

for row in news['title']:
    docs.append(row)
# print(len(docs))
# count_model = CountVectorizer(ngram_range=(1, 1))  # default unigram model
# X = count_model.fit_transform(news['title'])
# Xc = (X.T * X)  # this is co-occurrence matrix in sparse csr format
# Xc.setdiag(0)  # sometimes you want to fill same word cooccurence to 0
# print(Xc.todense())

# # TFID vectrization
# tf_vectorizer = TfidfVectorizer(stop_words='english', max_features=50000)
# news_matrix = tf_vectorizer.fit_transform(news['title'])


# # Fitting LDA
# lda = LatentDirichletAllocation(n_components=5, learning_method='online',
#                                 random_state=0, verbose=0, n_jobs=-1)
# lda_model = lda.fit(news_matrix)
# lda_matrix = lda_model.transform(news_matrix)


# # Data to be written in json
# topic_disctionary = {
#     "topics": ""
# }

# # print topics
# def print_topics(model, count_vectorizer, n_top_words):
#     all_topics = []
#     words = tf_vectorizer.get_feature_names()
#     for topic_idx, topic in enumerate(model.components_):
#         topics = {
#             "topic": topic_idx,
#             "words": [words[i]
#                       for i in topic.argsort()[:-n_top_words - 1:-1]]
#         }
#         all_topics.append(topics)
#         print("\nTopic #%d:" % topic_idx)
#         print(" ".join([words[i]
#                         for i in topic.argsort()[:-n_top_words - 1:-1]]))

#     topic_disctionary["topics"] = all_topics
#     with open('./static/assets/jsons/topics.json', "w") as json_file:
#         json.dump(topic_disctionary, json_file)


# # Print the topics found by the LDA model
# print("Topics found via LDA:")
# print_topics(lda_model, news_matrix, 50)

# Opening the preproceesed JSON file
f = open('./static/assets/jsons/topics.json',)

# returns JSON object as a dictionary
topic_data = json.load(f)

# Closing file
f.close()


# Word Similarities with Word2Vec or Glove

# Load pretrained word2vec model
# model = models.KeyedVectors.load_word2vec_format('static/assets/model/GoogleNews-vectors-negative300.bin', binary=True)

# # read the news titles as string
# sentences = news['title'].astype('str').tolist()

# # toeknize
# tokenizer = RegexpTokenizer(r'\w+')
# sentences_tokenized = [w.lower() for w in sentences]
# sentences_tokenized = [tokenizer.tokenize(i) for i in sentences_tokenized]

# # fine_tune
# model_2 = models.Word2Vec(size=300, min_count=1)
# model_2.build_vocab(sentences_tokenized)
# total_examples = model_2.corpus_count
# model_2.build_vocab([list(model.vocab.keys())], update=True)
# model_2.intersect_word2vec_format(
#     'static/assets/model/GoogleNews-vectors-negative300.bin', binary=True)
# model_2.train(sentences_tokenized,
#               total_examples=total_examples, epochs=model_2.iter)

# model_2.save("Tuned_Model.model")
# model_2 = models.Word2Vec.load("Tuned_Model.model")
# model_2.wv.save("Tuned_model_wv.wordvectors")
model = models.KeyedVectors.load("Tuned_model_wv.wordvectors", mmap='r')

# # Similar clusters based on Word2vec
# similarity_clusters = {
#     "all_clusters": []
# }
# cluster_per_topic = {
#     "per_topic": ""
# }

# use the model to find word similarities
# use threshold 0.3
# for i in range(0, 5):
#     per_topic_cluster_array = []
#     for j in range(0, 50):
#         word_dictionary = {
#             "word": "",
#             "similar_index": []
#         }
#         word_dictionary["word"] = topic_data["topics"][i]["words"][j]
#         similar_indices = []
#         for k in range(0, 50):
#             if j != k:
#                 print("here")
#                 word1 = topic_data["topics"][i]["words"][j]
#                 word2 = topic_data["topics"][i]["words"][k]
#                 if(word1 in model.vocab) and (word2 in model.vocab):
#                     print("here2")
#                     if(model.similarity(word1, word2) > 0.2):
#                         print("here3")
#                         similar_indices.append(word2)

#         word_dictionary["similar_index"] = similar_indices
#         per_topic_cluster_array.append(word_dictionary)
#     similarity_clusters["all_clusters"].append(per_topic_cluster_array)

# with open('./static/assets/jsons/word_group_2.json', "w") as json_f:
#     json.dump(similarity_clusters, json_f)


# Opening the preproceesed JSON file for clusters
f_2 = open('./static/assets/jsons/word_group_2.json',)

# returns JSON object as a dictionary
cluster_data = json.load(f_2)

# Closing file
f_2.close()


# Topics and keywords
global All_Topics_cache
global All_Keywords_cache
global Suggested_words

All_Topics_cache = []
All_Keywords_cache = []
Suggested_words = []

# generate suggestions based on keywords


def generate_suggestions(All_Topics, All_Keywords):
    global All_Topics_cache
    global All_Keywords_cache
    global Suggested_words
    # print(All_Topics)
    # print(All_Keywords)
    All_Topics_cache = All_Topics
    All_Keywords_cache = All_Keywords
    Suggested_words = []
    # print(All_Topics_cache)
    # print(All_Keywords_cache)
    # print(Suggested_words)

    for topicWords in All_Keywords_cache:
        avg_vector = model.wv[topicWords[0]]*0
        # create average word vector from the seed words
        for words in topicWords:
            avg_vector += model.wv[words]
        avg_vector = avg_vector/len(topicWords)
        # Find top 15 words close to those seed words
        model_word_vector = np.array(avg_vector, dtype='f')
        related_words = (model.most_similar(
            positive=[model_word_vector], topn=20))
        related_words_2 = []
        for w in related_words:
            related_words_2.append(w[0])
        Suggested_words.append(related_words_2)
    # print(Suggested_words)

    return


# Search for matching Instances
# global All_Instances

# All_Instances = []


def search_Instance():
    global Suggested_words
    All_Instances = []

    for per_topics in Suggested_words:
        per_topic_arr = []
        for doc_sentences in docs:
            for per_words in per_topics:
                if per_words in doc_sentences:
                    per_topic_arr.append(doc_sentences)
                    # print("true")
                    break

        All_Instances.append(per_topic_arr)
        # print(All_Instances)
    return All_Instances


# Load Pretrained Glove model
# print(list(gensim.downloader.info()['models'].keys()))
# glove_vectors = gensim.downloader.load('glove-twitter-25')
# print(glove_vectors.most_similar('twitter'))

# # print(len(model.vocab))
# UniversitySimilarities = model.most_similar(positive=['university'], topn=5)
# print(model.most_similar(positive=['university'], topn=5))
# Create and save default bias types
# This bias array is editable by user
bias_array = []
bias_dict = {
    "type": "Gender",
    "subgroup": ["Male", "Transgender", "Female"]
}
bias_array.append(bias_dict)
bias_dict = {
    "type": "Race",
    "subgroup": ["Black", "White", "Asian", "Hispanic", "South Asian"]
}
bias_array.append(bias_dict)
# bias_dict = {
#     "type": "Religion",
#     "subgroup": ["Christian", "Muslim", "Athiest", "Budhhist", "Hindu"]
# }
# bias_array.append(bias_dict)
bias_dict = {
    "type": "Income",
    "subgroup": ["High", "Low", "Mid"]
}
bias_array.append(bias_dict)

# create vocab group for each subgroup
subgroup_glossary = []
subgroup_dict = {
    "word": "Male",
    "type": "Gender",
    "group": ["he", "his", "him", "male", "man", "men", "boy", "boys"]
}
subgroup_glossary.append(subgroup_dict)

subgroup_dict = {
    "word": "Transgender",
    "type": "Gender",
    "group": ["trans", "transsexual", "bisexual", "Transgender", "unisexual"]
}
subgroup_glossary.append(subgroup_dict)

subgroup_dict = {
    "word": "Female",
    "type": "Gender",
    "group": ["she", "her", "female", "woman", "women", "girl", "girls"]
}
subgroup_glossary.append(subgroup_dict)

subgroup_dict = {
    "word": "Black",
    "type": "Race",
    "group": ["black", "colored", "blacks", "colorism", "african_american", "dark_skinned", "Black", "Blacks", "Afro", "african"]
}
subgroup_glossary.append(subgroup_dict)

subgroup_dict = {
    "word": "White",
    "type": "Race",
    "group": ["white", "whites", "caucasian", "caucasians", "Caucasoid", "light_skinned", "European", "european", "anglo", "Caucasian"]
}
subgroup_glossary.append(subgroup_dict)

subgroup_dict = {
    "word": "Asian",
    "type": "Race",
    "group": ["asian", "asians", "chinese", "japanese", "korean", "eastern", "Asian", "Asians", "China", "Chinese", "Japan", "Korea"]
}
subgroup_glossary.append(subgroup_dict)

subgroup_dict = {
    "word": "Hispanic",
    "type": "Race",
    "group": ["hispanic", "hispanics", "latino", "latina", "spanish", "mexican", "Mexico"]
}
subgroup_glossary.append(subgroup_dict)

subgroup_dict = {
    "word": "South Asian",
    "type": "Race",
    "group": ["indian", "indians", "deshi", "modi", "pakistani", "sri_lankan", "tamil", "India", "Nepal", "Bangladesh"]
}
subgroup_glossary.append(subgroup_dict)

subgroup_dict = {
    "word": "High",
    "type": "Income",
    "group": ["rich", "wealthy", "affluent", "prosperous", "richer", "richest", "affluence", "advantaged", "extravagant", "lavish", "luxuriant", "luxury", "classy", "privileged", "millionaire", "billionaire", "million", "billion"]
}
subgroup_glossary.append(subgroup_dict)

subgroup_dict = {
    "word": "Low",
    "type": "Income",
    "group": ["poor", "poors", "poorer", "poorest", "impoverished", "poverty", "needy", "penniless", "moneyless", "insolvent", "underprivileged", "bankrupt", "bankrupcy", "homeless"]
}
subgroup_glossary.append(subgroup_dict)

subgroup_dict = {
    "word": "Mid",
    "type": "Income",
    "group": ["middleclass", "workingclass", "bourgeois", "bourgeoisie", "common", "ordinary"]
}
subgroup_glossary.append(subgroup_dict)

# print(model.most_similar("indian", topn=35))
# print(model.similarity("white", "light_skinned"))

# Calculate bias for each word
Bias_Scores_Dict = {}
for i in range(0, 5):
    for j in range(0, 50):

        word = topic_data["topics"][i]["words"][j]
        len_glossary = len(subgroup_glossary)
        Bias_Score_Array = []
        for x in range(0, len_glossary):
            len_sb = len(subgroup_glossary[x]["group"])
            sum = 0
            bias_score = 0
            for y in range(0, len_sb):
                sum += model.similarity(word, subgroup_glossary[x]["group"][y])
            # print("word " + word + ","+" Bias Subgroup " +
                #   subgroup_glossary[x]["word"]+",Bias Score "+":")
            if len_sb > 0:
                # print(sum/len_sb)
                bias_score = sum/len_sb
            else:
                # print(0)
                bias_score = 0
            bias_score_obj = {
                "subgroup": subgroup_glossary[x]["word"],
                "type": subgroup_glossary[x]["type"],
                "bias_score": bias_score
            }
            Bias_Score_Array.append(bias_score_obj)
            # Bias_Score_Array[word] = bias_score_obj
        Bias_Scores_Dict[word] = Bias_Score_Array


with open('./static/assets/jsons/bias_scores.json', "w") as json_f:
    json.dump(Bias_Scores_Dict, json_f)

# Calculate max bias for each word
Max_Bias_Dict = {}
for i in range(0, 5):
    for j in range(0, 50):
        word = topic_data["topics"][i]["words"][j]
        current_type = Bias_Scores_Dict[word][0]["type"]
        max = -2
        max_subgroup = ""
        min = 2
        min_subgroup = ""
        max_array = []
        length = len(Bias_Scores_Dict[word])
        # print(Bias_Scores_Dict[word])

        for k in range(0, length):

            if(Bias_Scores_Dict[word][k]["type"] == current_type):
                if(Bias_Scores_Dict[word][k]["bias_score"] >= max):
                    max = Bias_Scores_Dict[word][k]["bias_score"]
                    max_subgroup = Bias_Scores_Dict[word][k]["subgroup"]
                if(Bias_Scores_Dict[word][k]["bias_score"] <= min):
                    min = Bias_Scores_Dict[word][k]["bias_score"]
                    min_subgroup = Bias_Scores_Dict[word][k]["subgroup"]
                if(k == length-1):
                    abs_dist = (max-min)
                    if((abs_dist) >= 0.05):
                        max_obj_current_type = {
                            "type": current_type,
                            "subgroup": max_subgroup,
                            "bias_score": max
                        }
                        max_array.append(max_obj_current_type)

            else:
                abs_dist = (max-min)
                if((abs_dist) >= 0.05):
                    max_obj_current_type = {
                        "type": current_type,
                        "subgroup": max_subgroup,
                        "bias_score": max
                    }
                    max_array.append(max_obj_current_type)
                    current_type = Bias_Scores_Dict[word][k]["type"]
                    max = -2
                    max_subgroup = ""
                    min = 2
                    min_subgroup = ""
                else:
                    current_type = Bias_Scores_Dict[word][k]["type"]
                    max = -2
                    max_subgroup = ""
                    min = 2
                    min_subgroup = ""
                if(Bias_Scores_Dict[word][k]["bias_score"] >= max):
                    max = Bias_Scores_Dict[word][k]["bias_score"]
                    max_subgroup = Bias_Scores_Dict[word][k]["subgroup"]
                if(Bias_Scores_Dict[word][k]["bias_score"] <= min):
                    min = Bias_Scores_Dict[word][k]["bias_score"]
                    min_subgroup = Bias_Scores_Dict[word][k]["subgroup"]

        Max_Bias_Dict[word] = max_array

with open('./static/assets/jsons/max_bias_scores.json', "w") as json_f:
    json.dump(Max_Bias_Dict, json_f)


# ******************************** Part to connect to React ***********************************//
# app = Flask(__name__, static_url_path='', static_folder='frontend/build')
# CORS(app)  # comment this on deployment
# api = Api(app)


# @app.route("/", defaults={'path': ''})
# def serve(path):
#     return send_from_directory(app.static_folder, 'index.html')


# api.add_resource(ApiHandler, '/flask/hello')


# ************************************** Comment out this part for testing react **********************//
# Declare application
app = Flask(__name__)


# Data to be written in json
related_word_disctionary = {
    "words": ""
}

# Main rendering part


@ app.route("/main", methods=["GET", "POST"])
@ app.route("/", methods=["GET", "POST"])
def homepage():
    searchKey = request.form.get("searchWord")
    print(searchKey)
    if searchKey:
        UniversitySimilarities = model.most_similar(
            positive=[searchKey], topn=15)

        related_word_disctionary["words"] = UniversitySimilarities
        with open('./static/assets/jsons/word.json', "w") as json_file:
            json.dump(related_word_disctionary, json_file)
    else:
        UniversitySimilarities = "None"

    return render_template("index.html")

# Send topic data to script


@ app.route('/topic_data')
def topicData():
    return topic_data

# send cluster data to script


@ app.route('/cluster_data')
def clusterData():
    return cluster_data

# Send bias array to script


@ app.route('/bias_types', methods=['GET'])
def biasTypeData():
    return jsonify(bias_array)


@ app.route('/bias_dictionary')
def biasDictData():
    return jsonify(Bias_Scores_Dict)


@ app.route('/max_bias_dictionary')
def maxBiasDictData():
    return jsonify(Max_Bias_Dict)


@app.route('/time')
def get_current_time():
    return {'time': time.time()}

# read in keywords from client


@app.route('/topics', methods=['POST'])
def topicRdfn():
    # POST request
    if request.method == 'POST':
        request_data = request.get_json()
        All_Topics = request_data["topics"]
        All_Keywords = request_data["keyWords"]
        # print(request.get_json())  # parse as JSON
        generate_suggestions(All_Topics, All_Keywords)
        return 'Sucesss', 200


@app.route('/gettopics', methods=['GET'])
def get_topic():
    time.sleep(1)
    # global Suggested_words
    count = 0
    while Suggested_words == []:
        count += 1
    return {'words': Suggested_words}


@app.route('/getinstances', methods=['GET'])
def get_instances():
    # time.sleep(1)
    # # global Suggested_words
    # count = 0
    # while Suggested_words == []:
    #     count += 1
    all_Instances = search_Instance()
    return {'instances': all_Instances}


if __name__ == "__main__":
    app.run(debug=True)
