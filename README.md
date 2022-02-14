# Interactive-Bias-Debugger

**Platform:**
FrontEnd: React.js, D3.js
BackEnd: Python
Server: Flask

**Instructions to set up Flask:**

1. Install Gensim and other dependencies

Make sure to have gensim version 3.8.3
You can downgrade to this version using the command below-
**pip3 install gensim==3.8.3**

2. Use python3 and pip3 throughout the setup process

3. Download Tuned_model_wv.wordvectors and Tuned_model_wv.wordvectors.vectors.npy from the link below and add
   them to your root directory (Under the same directory as app.py)
   https://drive.google.com/drive/folders/1zmJzL3BVrPwkduamZ9znvV64F9FdAgZb?usp=sharing

4. Download all the .csv files from the link below and add them inside **static/assets/data** folder of your project
   https://drive.google.com/drive/folders/1qXWzj06k7o9hFZ_HpRecsE1FTnSvLUJi?usp=sharing
5. To run the old version of the project, run **python3 app.py"** and open localhost:5000 in your browser to see the old version.

6. All Python and pip package versions are listed below-
   Python- 3.7.0
   Pip- 21.2.4
   gensim- 3.8.3
   Flask- 2.0.1
   nltk- 3.6.3
   numpy- 1.21.2
   pandas - 1.1.5
   sklearn - 0.0
   requests- 2.26.0
   scikit-learn- 0.24.2

**Instructions to set up the new React app hosted on the Flask server**

1.  Create a new directory e.g. "temp" inside root directory and create a React app inside that directory.
2.  Use the package.json given inside the frontend folder and replace the new one with it.
3.  Replace the public and src folder in your directory with the ones in "frontend" directory.
4.  Delete the old "frontend" directory and name your "temp" directory "frontend"
5.  You need to have **yarn** installed in order to run the react app on your Flask server.
6.  After intsalling yarn, add all yarn dependencies.
    If you go to the frontend folder and run the command **yarn start**, it will show you what packages you need to add to yarn
7.  Once you set up everything, go inside the frontend directory and open two seperate command prompt/terminal.
    run **yarn start** in one terminal and run **yarn start-api** in another terminal.
    The first one will start the react app and the second one will start the Flask server.
8.  If everything is fine, it will open the react app on **localhost:3000**

9.  Watch this link for more clarification on how to create a react app and set up with yarn to run on flask server
    https://blog.miguelgrinberg.com/post/how-to-create-a-react--flask-project
