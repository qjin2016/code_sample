The following Python code is a quick implementaion of a classification tree. NumPy library is used for data manipulation and calculation. There is a simple use case near the bottom. The code was written in Python 3.5. 

```python
# node class, building block for classification tree
# an illustration of a decision tree
'''
        root
       /    \
    left    right
    /  \    /   \
class1 ... ...  ...

'''
class Node(object):
    def __init__(self, feature = None, val = None, left = None, right = None):
        # non-leaf node
        self.feature = feature
        self.val = val
        self.left = left
        self.right = right
        
        # leaf node
        self.is_leaf = False
        self.major_class = None


class Train():
    
    def DataHandler(self, labels):
        '''
        Utility function to help calculate Gini Impurity index or Entropy
        ---
        
        Args:
            list of integers/floats, labels
            
        Returns:
            list of floats, proportion of each class in the dataset
        '''
        num_cases = len(labels) * 1.0
        _, counts = np.unique(labels, return_counts = True)
        return counts/num_cases

    
    def GiniImpurity(self, props):
        '''
        Caculate Gini Impurity index
        ---
        
        Args:
            float, props, list of floats 
            
        Returns:
            float, Gini Index
        '''
        return sum(map(lambda p: p * (1-p), props))

    
    def Entropy(self, props):
        '''
        Caculate Entropy
        ---
        
        Args:
            float, props, list of floats 
            
        Returns:
            float, Entropy score
        '''
        return sum(map(lambda p: p * np.log2(p+.0001), props))

    
    def SplitData(self, dataset, feature_index, value):
        '''
        Split data into two parts according to the feature index and its value, 
        the part with the feature value less than the specified value will be used to build the left sub tree,
        the part with the feature value larger than the specified value will be used to build the right sub tree
        ---
        
        Args:
            list of floats, dataset
            int, feature_index
            float, value
        
        Returns:
            two lists of floats   
        '''
        return dataset[dataset[:,feature_index] <= value], dataset[dataset[:,feature_index] > value]

    
    def BestSplit(self, dataset, metrics, min_size):
        '''
        Given a dataset, use Gini Impurity index or Entroy score to find the best split (brute force approach)
        ---
        
        Args:
            list of floats, dataset
            str, metics, choose 'Gini' or 'InfoGain'
            int, min_size, specify the minimum data points in a node, if the current 
            
        Returns:
            int, split_feature
            float, split_value
            float, best_gain
            
            however, if no further split is made, three Nones will be returned
        '''
        props = self.DataHandler(dataset[:,-1])
        
        # attach the specified metrics function
        if metrics == 'Gini':
            metrics = self.GiniImpurity
        elif metrics == 'InfoGain':
            metrics = self.Entropy
        else:
            raise Exception('Please type \'Gini\' or \'InfoGain\' for metrics')

        metrics_value_p = metrics(props)

        best_gain = 0
        split_feature = None
        split_value = None

        # find best split (brute force)
        for feature in range(len(dataset[0])-1):
            for v in set(dataset[:,feature]):
                d1, d2 = dataset[dataset[:,feature] <= v], dataset[dataset[:,feature] > v]
                l1, l2 = d1[:,-1], d2[:,-1]
                p1, p2 = self.DataHandler(l1), self.DataHandler(l2)
                metrics_value_kids = metrics(p1) + metrics(p2)
                gain = metrics_value_p - metrics_value_kids

                if gain > best_gain and min([len(d1), len(d2)]) >= min_size:
                    split_feature = feature
                    split_value = v
                    best_gain = gain
                    
        return split_feature, split_value, best_gain

    
    def AddTerminal(self, dataset):
        '''
        Add leaf node to the decision tree
        '''
        classes, counts = np.unique(dataset[:,-1], return_counts = True)
        return classes[np.argmax(counts)]
    
    def _TrainUtil(self, metrics, min_size, max_depth, min_gain, dataset, node):
        '''
        Utility function for building decision tree
        ---
        
        Args: 
            str, metrics, 'Gini' or 'Infogain'
            int, min_size
            int, max_depth
            float, min_gain
            [[float, float ...], [float, float, ...], ...], dataset
            Node, node
        '''
        # add leaf node if the current node contains the data from the same class
        if len(list(set(dataset[:,-1]))) == 1:
            node.is_leaf = True
            node.major_class = dataset[0,-1]
            return

        # add leaf node if the current node contains data less than the specified minimum size
        # or the tree had grown into the specified height
        if len(dataset) <= min_size or max_depth < 0:
            node.is_leaf = True
            node.major_class = self.AddTerminal(dataset)
            return

        split_feature, split_value, best_gain = self.BestSplit(dataset, metrics, min_size)

        # add leaf node if BestSplit function can't find further split or the split doesn't 
        # improve the Gini Impurity index or Entropy score to the specified quantity
        if split_feature is None or best_gain < min_gain:
            node.is_leaf = True
            node.major_class = self.AddTerminal(dataset)
            return

        else:
            # grow tree
            node.val = split_value
            node.feature = split_feature

            left, right = self.SplitData(dataset, split_feature, split_value)
            node.left, node.right = Node(), Node()
            self._TrainUtil(metrics, min_size, max_depth-1, min_gain, left, node.left)
            self._TrainUtil(metrics, min_size, max_depth-1, min_gain, right, node.right)
    
    def _Train(self, metrics, min_size, max_depth, min_gain):
        '''
        Main fucntion to train data/grow decision tree
        '''
        root = self.root
        dataset = self.dataset
        self._TrainUtil(metrics, min_size, max_depth, min_gain, dataset, root)


class Predict():
    
    def _Predict_Single(self, node, data_row):
        '''
        Given one row of data, make predictions based on the trained decision tree
        ---
        
        Args:
            Node, node, should be the root of a decision tree
            [float, ...], data_row
        '''
        if node.is_leaf:
            return node.major_class

        if data_row[node.feature] <= node.val:
            return self._Predict_Single(node.left, data_row)

        else:
            return self._Predict_Single(node.right, data_row)
        
        
    def _PredictUtil(self, test_data, root):
        '''
        Given the whole testing data, make predictions based on the trained decision tree
        ---
        
        Args:
            [float, ...], test_data
            Node, root, trained decision tree
            
        Returns:
            int/float, predicted class
        '''
        predicted = [None for x in range(len(test_data))]
        for i, d in enumerate(test_data):
            predicted[i] = self._Predict_Single(root, d) 
        return predicted
    
    def _Predict(self, test_data):
        '''
        Main predict function
        '''
        root = self.root
        return self._PredictUtil(test_data, self.root)
        
class TreeClassifier(Train, Predict):
    def __init__(self, dataset):
        self.dataset = dataset
        self.root = Node()
```

### use case (using iris data: https://en.wikipedia.org/wiki/Iris_flower_data_set)
```python
import numpy as np

### read iris data
iris = []
with open('./iris.txt', 'r') as file:
    for line in file:
        if line != '':
            line = line.strip()
            l = line.split(',')
            if l != ['']:
                iris.append(l)

### transform data format
name_dict = {'Iris-setosa': 0, 'Iris-versicolor': 1, 'Iris-virginica': 2, '': 3}
for l in iris: 
    name = l[-1]
    l[-1] = int(name_dict[name])
    
for l in iris:
    for i in range(len(l) - 1):
        l[i] = float(l[i])

### training
decision_tree = TreeClassifier(np.array(iris))
decision_tree._Train('Gini', 10, 4, .001)

### evaluate training results using confusion matrics
preds = test._Predict(np.array(iris))

from sklearn.metrics import confusion_matrix
confusion_matrix(np.array(iris)[:,-1], preds)

```
