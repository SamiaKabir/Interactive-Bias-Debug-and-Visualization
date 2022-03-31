import pymongo
import time


startTime = time.time()


# python sript starts here
myclient = pymongo.MongoClient("mongodb://localhost:27017/")
mydb = myclient["articles"]
mycol = mydb["products"]

keywords=['Crime','Crimes','criminal','viloence']

for keyword in keywords:
	mydoc = mycol.aggregate([{'$project': {'_id':0, 'id': 1, 'content': 1, 'firstOccurrenceIndex': {'$indexOfCP': ['$content', keyword] },
	    'scontent': {'$split' : ['$content', keyword]},  'keywordLength': {'$strLenCP': keyword}, 'sentenceLength': {'$strLenCP': '$content'}
	     }},

	     {'$match':{'firstOccurrenceIndex': {'$gt': -1}  }},
	     #{'$project': {'scontent': 1, 'moreThanOne': { '$gt': [ {'$size': '$scontent' }, 1 ] }, 'firstIndex': 1 }}
	    
	    {'$project': {'id': 1, 'content': 1, 'scontent': 1, 'lastSplitLength': {'$strLenCP': {'$reduce': {'input': {'$slice': [ '$scontent', -1 ]}, 
	    'initialValue': "", 'in': { '$concat' : ["$$value", "$$this"] }}}}, 
	    'keywordLength': 1,  'sentenceLength': 1, 'firstOccurrenceIndex': 1 }},

	    {'$project': {'id': 1, 'content': 1, 'firstOccurrenceIndex': 1, 'lastOccurrenceIndex': {'$subtract' : ['$sentenceLength', {'$add': ['$lastSplitLength', '$keywordLength'] } ] } } } 
	     ])

	i = 0 
	for x in mydoc:
	  print(x)
	  i += 1

	  if i == 5: break


##### python script ends here #####

executionTime = (time.time() - startTime)
print('Execution time in seconds: ' + str(executionTime))

# myquery = { [ {'$project': {'_id':0, 'id': 1, 'content': 1, 'firstIndex': {'$indexOfCP': ['$content', 'Congressional'] }}}, {'$match':{'firstIndex': {'$gt': -1}  }}  ]  }

# mydoc = mycol.aggregate([ {'$project': {'_id':0, 'id': 1, 'content': 1, 'firstIndex': {'$indexOfCP': 
# ['$content', 'Congressional'] }}}, 
# {'$match':{'firstIndex': {'$gt': -1}  }}  ] )

# mydoc = mycol.aggregate([{'$project': {
#     'scontent': {'$split' : ['$content', 'Republicans']}
#      }},
#      {'$project': {'scontent': 1, 'moreThanOne': { '$gt': [ {'$size': '$scontent' }, 1 ] } }}
     
#      ])