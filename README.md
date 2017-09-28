# Code sample

Two code samples are provided here. One is using Python, the other one is using front end tools for interactive data visualization of class discussion topics.

### 1, Python 3.5, Machine Learning, Decision Tree: https://github.com/qjin2016/code_sample/blob/master/python_decision_tree.md
This is a qucik implementation of a machine learning algorithm -- decision tree for classification tasks. A use case using iris data is also included.


### 2, D3, Web Development, Interactive data visualization: https://github.com/qjin2016/code_sample/tree/master/web
The link contains an interactive data visualization tool built on top of HTML, CSS, jQuery and d3.js. This tool is currently accessible online (please use Chrome to view this visualization): http://students.washington.edu/jinqu/viz_discussion/web/ 

This tool was built to visualize various topics of class discussions. Data was scraped from online class discussion platform and topics was generated through LDA algorithm. Code for data collection and topic mining is not included here. 

On the visualization page, the small circles represent students while the big circles represent topics. If a student (small circle) has discussed a certain topic (a bid circle), there would be a line connecting the small and the big circle. The line width indicates the strength of the connection, the thinker the line, the stronger the connection. As the topics were generated from LDA algorithm, which is essentially a probablistic data mining algorithm, the connection strength can be interpreted as the probability that LDA thinks the student A talked about the topic X.


### 3, Python 2.7, Query and Plot Data from Remote Database on AWS cloud: https://github.com/qjin2016/code_sample/blob/master/python_sample.md
The code was written to connect to a MSSQL server on Amazon Web Service (AWS), query data (temperature) that was recorded within a specified time interval and generate line plots.
