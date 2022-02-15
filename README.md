# Interactive-Bias-Debugger

**Platform:**
This is a React app hosted on Flask server. For visualization, D3.js is used.<br />
FrontEnd: React.js, D3.js <br />
BackEnd: Python <br />
Server: Flask <br />

**Instructions to set up Flask:**

1. Install Gensim and other dependencies

   Make sure to have gensim version 3.8.3 <br />
   You can downgrade to this version using the command below- <br />
   **pip3 install gensim==3.8.3**

2. Use python3 and pip3 throughout the setup process and execution afterwards

3. Download Tuned_model_wv.wordvectors and Tuned_model_wv.wordvectors.vectors.npy from the link below and add
   them to your root directory (Under the same directory as app.py) <br />
   https://drive.google.com/drive/folders/1zmJzL3BVrPwkduamZ9znvV64F9FdAgZb?usp=sharing

4. Download all the .csv files from the link below and add them inside **static/assets/data** folder of your project <br />
   https://drive.google.com/drive/folders/1qXWzj06k7o9hFZ_HpRecsE1FTnSvLUJi?usp=sharing

5. To run the old version of the project, run **python3 app.py** and open localhost:5000 in your browser to see the old version.

6. All Python and pip package versions are listed below- <br />
   Python- 3.7.0 <br />
   Pip- 21.2.4 <br />
   gensim- 3.8.3 <br />
   Flask- 2.0.1 <br />
   nltk- 3.6.3 <br />
   numpy- 1.21.2 <br />
   pandas - 1.1.5 <br />
   sklearn - 0.0 <br />
   requests- 2.26.0 <br />
   scikit-learn- 0.24.2 <br />

**Instructions to set up the new React app hosted on the Flask server**

1.  Name the "frontend" directory something else, e.g. "temp".

2.  Create a new directory "frontend" inside root directory. Go inside the new "frontend" directory and create a React app inside that directory
    with the command **create-react-app .**.
3.  You can either Use the package.json given inside the "temp" folder and replace the new one with it. <br/>
    Or copy "scripts" from "package.json" in "temp" and replace your "scripts" with it and copy "proxy" from the package.json in "temp" and add that to your package.json.
4.  Replace the public and src folder in your directory with the ones in "temp" directory.
5.  Delete the old frontend directory or "temp" directory in this case.
6.  You need to have **yarn** installed in order to run the react app on your Flask server.
7.  After intsalling yarn, add all yarn dependencies.
    If you go to the frontend folder and run the command **yarn start**, it will show you what packages you need to add to yarn
8.  Once you set up everything, go inside the frontend directory and open two seperate command prompt/terminal.
    run **yarn start** in one terminal and run **yarn start-api** in another terminal.
    The first one will start the react app and the second one will start the Flask server.
9.  If everything is fine, it will open the react app on **localhost:3000**

10. Watch this link for more clarification on how to create a react app and set up with yarn to run on flask server
    https://blog.miguelgrinberg.com/post/how-to-create-a-react--flask-project
