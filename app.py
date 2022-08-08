from ast import Global, Sub
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
from similar_words import remove_similar_words
import re
import string
# from flask_cors import CORS  # comment this on deployment
# from api.ApiHandler import ApiHandler


# load data
fields = ['title', 'content']
news = pd.read_csv('static/assets/data/articles1.csv',
                   skipinitialspace=True, usecols=fields)

docs = []
contents = []

for row in news['title']:
    docs.append(row)

for row in news['content']:
    contents.append(row)


# Opening the preproceesed JSON file
f = open('./static/assets/jsons/topics.json',)

# returns JSON object as a dictionary
topic_data = json.load(f)

# Closing file
f.close()


# Train a word2vec model, save it and load it afterwards

# read the news titles as string
sentences = news['title'].astype('str').tolist()
# read the news content as string
sentences_2 = news['content'].astype('str').tolist()

# create the list of lists of all vocab
# sentences = sentences+sentences_2

# # toeknize
# tokenizer = RegexpTokenizer(r'\w+')
# sentences_tokenized = [w for w in sentences]
# sentences_tokenized = [tokenizer.tokenize(i) for i in sentences_tokenized]

# total_examples_train = len(sentences_tokenized)

# # train model with the news data
# model = Word2Vec(sentences=sentences_tokenized, size=300,
#  window=5, min_count=1, workers=4)
# # save models and vectors
# model.save("Tuned_Model.model")
# model.wv.save("Tuned_model_wv.wordvectors")


global model
model = models.KeyedVectors.load("Tuned_model_wv.wordvectors", mmap='r')


def setModelInit():
    global model
    model = models.KeyedVectors.load("Tuned_model_wv.wordvectors", mmap='r')


def changeModel(selectedModel):
    global model
    if selectedModel == 1:
        # # load the word2vec model's vector trained on the data

        model = models.KeyedVectors.load(
            "Tuned_model_wv.wordvectors", mmap='r')

    elif selectedModel == 2:
        # # Load Pretrained Glove model vectors
        # print(list(gensim.downloader.info()['models'].keys()))
        # model = gensim.downloader.load('glove-twitter-25')
        model = models.KeyedVectors.load(
            "./glove_vectors/Glove_model_wv.wordvectors", mmap='r')

# elif selectedModel==3:
    # load bert data


# # Load Pretrained Glove model
# print(list(gensim.downloader.info()['models'].keys()))
# model = gensim.downloader.load('glove-twitter-25')

# load pre-trained fasttext model
# model = gensim.downloader.load('fasttext-wiki-news-subwords-300')


# Topics and keywords
global All_Topics_cache
global All_Keywords_cache
global Suggested_words
global Updated_Suggested_words

All_Topics_cache = []
All_Keywords_cache = []
Suggested_words = []
Updated_Suggested_words = []

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
        topic_length = 0
        for words in topicWords:
            if(words in model.vocab):
                avg_vector += model.wv[words]
                topic_length += 1
        avg_vector = avg_vector/topic_length
        # Find top 15 words close to those seed words
        model_word_vector = np.array(avg_vector, dtype='f')
        related_words = (model.most_similar(
            positive=[model_word_vector], topn=20))
        related_words_2 = []
        for w in related_words:
            new_word = re.sub(r'[^\w\s]', '', w[0])
            related_words_2.append(new_word)
        Suggested_words.append(related_words_2)
    # print(Suggested_words)

    # # write in text file to send to lixiang
    # with open('topics.txt', 'w') as f:
    #     for item in Suggested_words:
    #         f.write("%s\n" % item)

    return

# reassign posted value if suggestion is not asked for


def reassign_suggestions(All_Keywords):
    global Suggested_words
    Suggested_words = All_Keywords
    return


# Search for matching Instances
global All_Instances
global All_Instance_contents
All_Instances = []
All_Instance_contents = []


def search_Instance(index_to_search):
    global Suggested_words
    global All_Instances
    global All_Instance_contents
    global Updated_Suggested_words
    # All_Instances = []
    # All_Instance_contents = []

    topic_length = len(Suggested_words)
    current_length = len(All_Instances)
    search_flag = False

    if(len(Updated_Suggested_words) == 0):
        search_flag = True
        Updated_Suggested_words = Suggested_words

    elif(len(Updated_Suggested_words) <= index_to_search):
        search_flag = True
        Updated_Suggested_words = Suggested_words

    elif (len(Updated_Suggested_words) > index_to_search):
        if(len(Updated_Suggested_words[index_to_search]) != len(Suggested_words[index_to_search])):
            search_flag = True
            topic_length = index_to_search+1
            current_length = index_to_search
            Updated_Suggested_words = Suggested_words
            # All_Instances[index_to_search] = []
            # All_Instance_contents[index_to_search] = []
        else:
            for i in range(0, len(Updated_Suggested_words[index_to_search])):
                if Updated_Suggested_words[index_to_search][i] != Suggested_words[index_to_search][i]:
                    search_flag = True
                    topic_length = index_to_search+1
                    current_length = index_to_search
                    Updated_Suggested_words = Suggested_words
                    # All_Instances[index_to_search] = []
                    # All_Instance_contents[index_to_search] = []

    for xx in range(current_length, topic_length):
        per_topics = Suggested_words[xx]
        per_topic_arr = []
        content_arr = []
        sentence_count = 0
        pattern = ""

        if(len(All_Instances) <= xx):
            All_Instances.append([])
            All_Instance_contents.append([])
        else:
            All_Instances[xx] = []
            All_Instance_contents[xx] = []

        # for per_words in per_topics:
        for i in range(0, len(per_topics)):
            if(i < len(per_topics)-1):
                pattern += str(" "+per_topics[i]+" "+"|")
            else:
                pattern += str(" "+per_topics[i]+" ")

        print(pattern)
        for doc_sentences in docs:
            content_sentence = contents[sentence_count]

            if re.search(pattern, (" "+str(doc_sentences)+" ")):
                # if (" "+per_words+" ") in (" "+doc_sentences+" "):

                # ''.join(doc_sentences.split()):
                # per_topic_arr.append(doc_sentences)
                per_topic_arr.append(docs[sentence_count])
                content_arr.append(contents[sentence_count])
                # print("true")
                # break
            elif re.search(pattern, (" "+str(content_sentence)+" ")):
                per_topic_arr.append(docs[sentence_count])
                content_arr.append(contents[sentence_count])
                # break
            sentence_count += 1

        All_Instances[xx] = per_topic_arr
        All_Instance_contents[xx] = content_arr

    return All_Instances, All_Instance_contents


global bias_array
global subgroup_glossary
bias_array = []
subgroup_glossary = []
# Create and save default bias types
# This bias arrays are editable by user


def bias_init():
    global All_Instances
    global All_Instance_contents
    All_Instances = []
    All_Instance_contents = []
    global bias_array
    global subgroup_glossary
    bias_array = []
    # bias_dict = {
    #     "type": "Gender",
    #     "subgroup": ["Male", "Transgender", "Female"]
    # }
    bias_dict = {
        "type": "Gender",
        "subgroup": ["Male", "Female"]
    }
    bias_array.append(bias_dict)
    # bias_dict = {
    #     "type": "Race",
    #     "subgroup": ["Black", "White", "Asian", "Hispanic", "South Asian"]
    # }
    bias_dict = {
        "type": "Race",
        "subgroup": ["Black", "White", "Asian", "Hispanic"]
    }
    bias_array.append(bias_dict)
    # bias_dict = {
    #     "type": "Religion",
    #     "subgroup": ["Christian", "Muslim", "Athiest", "Budhhist", "Hindu"]
    # }
    # bias_array.append(bias_dict)
    bias_dict = {
        "type": "Income",
        "subgroup": ["High Income", "Low Income", "Mid Income"]
    }
    bias_array.append(bias_dict)
    bias_dict = {
        "type": "Age",
        "subgroup": ["Old", "Young"]
    }
    bias_array.append(bias_dict)

    # create vocab group for each subgroup
    subgroup_glossary = []
    subgroup_dict = {
        "word": "Male",
        "type": "Gender",
        "group": ["he", "his", "him", "male", "man", "men", "boy", "boys", "guy", "guys", "Men", "Man", "himself"]
    }
    subgroup_glossary.append(subgroup_dict)

    # subgroup_dict = {
    #     "word": "Transgender",
    #     "type": "Gender",
    #     "group": ["trans", "transsexual", "bisexual", "Transgender"]
    # }
    # subgroup_glossary.append(subgroup_dict)

    subgroup_dict = {
        "word": "Female",
        "type": "Gender",
        "group": ["she", "her", "female", "woman", "women", "girl", "girls", "Woman", "Women", "herself"]
    }
    subgroup_glossary.append(subgroup_dict)

    subgroup_dict = {
        "word": "Black",
        "type": "Race",
        "group": ["black", "colored", "blacks", "african_american", "dark_skinned", "Black", "Blacks", "Afro", "african"]
    }
    subgroup_glossary.append(subgroup_dict)

    subgroup_dict = {
        "word": "White",
        "type": "Race",
        "group": ["white", "whites", "caucasian", "caucasians", "Caucasoid", "light_skinned", "European", "european", "Caucasian"]
    }
    subgroup_glossary.append(subgroup_dict)

    subgroup_dict = {
        "word": "Asian",
        "type": "Race",
        "group": ["asian", "asians", "chinese", "japanese", "korean", "Asian", "Asians", "China", "Chinese", "Japan", "Korea", "Indian", "Indians"]
    }
    subgroup_glossary.append(subgroup_dict)

    subgroup_dict = {
        "word": "Hispanic",
        "type": "Race",
        "group": ["hispanic", "hispanics", "latino", "latina", "spanish", "mexican", "Mexico"]
    }
    subgroup_glossary.append(subgroup_dict)

    # subgroup_dict = {
    #     "word": "South Asian",
    #     "type": "Race",
    #     "group": ["indian", "indians", "pakistani", "sri_lankan", "India", "Nepal", "Bangladesh"]
    # }
    # subgroup_glossary.append(subgroup_dict)

    subgroup_dict = {
        "word": "High Income",
        "type": "Income",
        "group": ["rich", "wealthy", "affluent", "richest", "affluence", "advantaged", "privileged", "millionaire", "billionaire"]
    }
    subgroup_glossary.append(subgroup_dict)

    subgroup_dict = {
        "word": "Low Income",
        "type": "Income",
        "group": ["poor", "poors", "poorer", "poorest", "poverty", "needy", "penniless", "moneyless", "underprivileged", "homeless"]
    }
    subgroup_glossary.append(subgroup_dict)

    subgroup_dict = {
        "word": "Mid Income",
        "type": "Income",
        "group": ["middleclass", "workingclass", "Middleclass", "Workingclass", "middleincome", "whitecollarclass"]
    }
    subgroup_glossary.append(subgroup_dict)

    subgroup_dict = {
        "word": "Old",
        "type": "Age",
        "group": ["Old", "old", "elderly", "aged", "senior", "retiree"]
    }
    subgroup_glossary.append(subgroup_dict)

    subgroup_dict = {
        "word": "Young",
        "type": "Age",
        "group": ["young", "Young", "youth", "teenager", "teen", "children"]
    }
    subgroup_glossary.append(subgroup_dict)


bias_init()


# print(model.most_similar("indian", topn=35))
# print(model.similarity("white", "light_skinned"))

# Calculate bias and max bias for each word


def calculate_bias():
    global Suggested_words
    global bias_array
    global subgroup_glossary
    Bias_Scores_Dict = {}
    Max_Bias_Dict = {}

    # print(subgroup_glossary)
    # Calculate bias for each word
    for per_topics in Suggested_words:
        for per_words in per_topics:
            word = per_words
            len_glossary = len(subgroup_glossary)
            Bias_Score_Array = []
            for x in range(0, len_glossary):
                if(word in model.vocab):
                    len_sb = len(subgroup_glossary[x]["group"])
                    sum = 0
                    bias_score = 0
                    for y in range(0, len_sb):
                        if not (subgroup_glossary[x]["group"][y] in model.vocab):
                            len_sb -= 1
                        else:
                            sum += model.similarity(word,
                                                    subgroup_glossary[x]["group"][y])
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

                else:
                    bias_score_obj = {
                        "subgroup": subgroup_glossary[x]["word"],
                        "type": subgroup_glossary[x]["type"],
                        "bias_score": 0
                    }
                    Bias_Score_Array.append(bias_score_obj)

                # Bias_Score_Array[word] = bias_score_obj
            Bias_Scores_Dict[word] = Bias_Score_Array
    # with open('./static/assets/jsons/bias_scores.json', "w") as json_f:
    #     json.dump(Bias_Scores_Dict, json_f)

    # Calculate max bias for each word
    for per_topics in Suggested_words:
        for per_words in per_topics:
            word = per_words
            try:
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
                            if((abs_dist) >= 0.03):
                                if(max > 0):
                                    max_obj_current_type = {
                                        "type": current_type,
                                        "subgroup": max_subgroup,
                                        "bias_score": max
                                    }
                                    max_array.append(max_obj_current_type)

                    else:
                        abs_dist = (max-min)
                        if((abs_dist) >= 0.03):
                            if(max > 0):
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
            except KeyError as error:
                print('The given key does not exist in the dictionary')

    # with open('./static/assets/jsons/max_bias_scores.json', "w") as json_f:
    #     json.dump(Max_Bias_Dict, json_f)

    return Bias_Scores_Dict, Max_Bias_Dict


# Update bias
def updateBias(new_bias_array, new_subgroup_glossary):
    global bias_array
    global subgroup_glossary
    bias_array = new_bias_array
    subgroup_glossary = new_subgroup_glossary


# with open('glossary.txt', 'w') as f:
#     for item in subgroup_glossary:
#         f.write("%s\n" % subgroup_glossary)
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

# Send bias array to script


@ app.route('/bias_types', methods=['GET'])
def biasTypeData():
    bias_init()
    global bias_array
    return jsonify(bias_array)


@ app.route('/bias_glossary', methods=['GET'])
def biasGlossaryData():
    bias_init()
    setModelInit()
    global subgroup_glossary
    return jsonify(subgroup_glossary)


# @ app.route('/bias_dictionary')
# def biasDictData():
#     return jsonify(Bias_Scores_Dict)


# @ app.route('/max_bias_dictionary')
# def maxBiasDictData():
#     return jsonify(Max_Bias_Dict)


@ app.route('/time')
def get_current_time():
    return {'time': time.time()}

# read in keywords from client


@ app.route('/topics', methods=['POST'])
def topicRdfn():
    # POST request
    if request.method == 'POST':
        request_data = request.get_json()
        All_Topics = request_data["topics"]
        All_Keywords = request_data["keyWords"]
        generate_suggestions(All_Topics, All_Keywords)
        return 'Sucesss', 200


@ app.route('/posttopics', methods=['POST'])
def posttopicRdfn():
    # POST request
    if request.method == 'POST':
        request_data = request.get_json()
        All_Keywords = request_data["keyWords"]
        reassign_suggestions(All_Keywords)
        return 'Sucesss', 200


@ app.route('/gettopics', methods=['GET'])
def get_topic():
    time.sleep(1)
    # global Suggested_words
    count = 0
    while Suggested_words == []:
        count += 1
    lemmatize_words = []
    for words in Suggested_words:
        lemmatize_words.append(remove_similar_words(words))

    return {'words': Suggested_words, 'repWords': lemmatize_words}


@ app.route('/getinstances', methods=['GET'])
def get_instances():
    search_index = request.args.get("param1")
    all_Instances = search_Instance(int(search_index))
    return {'instances': all_Instances[0], 'contents': all_Instances[1]}


@ app.route('/getbiases', methods=['GET'])
def get_biases():
    all_biases = calculate_bias()
    return {'biases': all_biases[0], 'max_biases': all_biases[1]}


@ app.route('/biasupdates', methods=['POST'])
def biasUpdateRdfn():
    # POST request
    if request.method == 'POST':
        request_data = request.get_json()
        # print(request_data)
        new_bias_array = request_data["biasTypes"]
        new_subgroup_glossary = request_data["biasGlossary"]
        if(new_bias_array and new_subgroup_glossary):
            updateBias(new_bias_array, new_subgroup_glossary)
        return 'Sucesss', 200


@ app.route('/selectmodel', methods=['POST'])
def selectModelfn():
    # POST request
    if request.method == 'POST':
        request_data = request.get_json()
        # print(request_data)
        changeModel(request_data)
        return 'Sucesss', 200


@ app.route('/logclick', methods=['POST'])
def logClickonApp():
    # POST request
    if request.method == 'POST':
        log_data = request.get_json()
        print("panel: "+str(log_data))
        return 'Sucesss', 200


if __name__ == "__main__":
    app.run(debug=True)
