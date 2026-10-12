### 1. High-Yield "On-Paper" Calculation Drills

---

#### A. Decision Tree Splitting: Entropy & Information Gain

In decision tree induction, splits are chosen to maximize **Information Gain ($IG$)** or minimize impurity.

Given a target attribute $Y$ with classes $\{c_1, c_2, \dots, c_k\}$:


$$\text{Entropy: } H(Y) = -\sum_{i=1}^{k} p(c_i) \log_2 p(c_i)$$

$$\text{Weighted Child Entropy: } H(Y \mid X) = \sum_{v \in \text{values}(X)} \frac{\vert{}D_v\vert{}}{\vert{}D\vert{}} H(D_v)$$

$$\text{Information Gain: } IG(Y, X) = H(Y) - H(Y \mid X)$$

**Practice Problem (From Week 3, Slide 50):**

| Student | Study Time | Sleep Quality | Result |
| --- | --- | --- | --- |
| 1 | High | Good | Pass |
| 2 | High | Poor | Pass |
| 3 | Low | Good | Fail |
| 4 | Low | Poor | Fail |
| 5 | High | Good | Pass |
| 6 | Low | Good | Fail |
| 7 | High | Poor | Pass |

*Step 1: Compute Parent Entropy $H(D)$*

* Total samples $N = 7$ (4 Pass, 3 Fail).


* $p(\text{Pass}) = \frac{4}{7}$, $p(\text{Fail}) = \frac{3}{7}$.



$$H(D) = -\left(\frac{4}{7}\log_2\frac{4}{7} + \frac{3}{7}\log_2\frac{3}{7}\right) \approx -(0.5714 \cdot (-0.8074) + 0.4286 \cdot (-1.2224)) \approx 0.985 \text{ bits}$$




*Step 2: Evaluate Split on "Study Time"*

* **High** ($N = 4$): 4 Pass, 0 Fail $\implies H(\text{High}) = -\left(\frac{4}{4}\log_2 1 + 0\right) = 0$.


* **Low** ($N = 3$): 0 Pass, 3 Fail $\implies H(\text{Low}) = -\left(0 + \frac{3}{3}\log_2 1\right) = 0$.


* Weighted Entropy: $H(D \mid \text{Study Time}) = \frac{4}{7}(0) + \frac{3}{7}(0) = 0$.


* Information Gain: $IG = 0.985 - 0 = \mathbf{0.985}$.



*Step 3: Evaluate Split on "Sleep Quality"*

* **Good** ($N = 4$): 2 Pass (students 1, 5), 2 Fail (students 3, 6).



$$H(\text{Good}) = -\left(\frac{2}{4}\log_2\frac{2}{4} + \frac{2}{4}\log_2\frac{2}{4}\right) = 1.0\text{ bit}$$



* **Poor** ($N = 3$): 2 Pass (students 2, 7), 1 Fail (student 4).



$$H(\text{Poor}) = -\left(\frac{2}{3}\log_2\frac{2}{3} + \frac{1}{3}\log_2\frac{1}{3}\right) \approx 0.918\text{ bits}$$



* Weighted Entropy: $H(D \mid \text{Sleep Quality}) = \frac{4}{7}(1.0) + \frac{3}{7}(0.918) = 0.5714 + 0.3934 = 0.965$.


* Information Gain: $IG = 0.985 - 0.965 = \mathbf{0.020}$.



*Conclusion:* Split on **Study Time** first because it yields the higher Information Gain ($0.985 > 0.020$) and perfectly partitions the classes.

---

#### B. Decision Tree Splitting: Gini Impurity Index

For $C$ classes, Gini impurity measures the expected error rate of randomly assigning a label drawn from the node's distribution:


$$\text{Gini}(D) = \sum_{i=1}^{C} p(i)(1 - p(i)) = 1 - \sum_{i=1}^{C} p(i)^2$$


For binary classification ($p$ and $1 - p$):


$$\text{Gini}_{\text{binary}} = 2p(1 - p)$$

**Hand Calculation Procedure:**

1. Compute $\text{Gini}_{\text{left}}$ and $\text{Gini}_{\text{right}}$ for the candidate split.


2. Compute the weighted average:

$$\text{Gini}_{\text{split}} = \frac{N_{\text{left}}}{N}\text{Gini}_{\text{left}} + \frac{N_{\text{right}}}{N}\text{Gini}_{\text{right}}$$



3. Choose the candidate threshold that minimizes $\text{Gini}_{\text{split}}$.



---

#### C. Feature Scaling: Normalization vs. Standardization

* **Min-Max Normalization:** Rescales values strictly to the interval $[0, 1]$. Highly sensitive to outliers.



$$\bar{x}^{(j)} = \frac{x^{(j)} - \min^{(j)}}{\max^{(j)} - \min^{(j)}}$$



* **Z-score Standardization:** Centers data around mean 0 with standard deviation 1. Does not produce a fixed bounded range.



$$\hat{x}^{(j)} = \frac{x^{(j)} - \mu^{(j)}}{\sigma^{(j)}}, \quad \text{where } \mu = \frac{1}{N}\sum x_i, \quad \sigma = \sqrt{\frac{1}{N}\sum (x_i - \mu)^2}$$




**Data Leakage Warning for Midterm Questions:**
Scaling statistics ($\min, \max, \mu, \sigma$) must **only** be calculated over the **training set**. Transforming the test set must use the stored training statistics, never test-set statistics.

---

#### D. Confusion Matrix, Evaluation Metrics & ROC by Hand

Binary classification definitions:

* $\text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN}$

* $\text{Precision} = \frac{TP}{TP + FP}$ (Fraction of positive predictions that are true)


* $\text{Recall} = \text{TPR} = \text{Sensitivity} = \frac{TP}{TP + FN}$ (Fraction of actual positives captured)


* $\text{Specificity} = \text{TNR} = \frac{TN}{TN + FP}$

* $\text{FPR} = 1 - \text{Specificity} = \frac{FP}{FP + TN}$

* $F_1\text{-score} = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$ (Harmonic mean)



**ROC Curve Construction by Hand (Week 4, Slide 39–49 Example):**

* Total samples $N = 10$: Positives ($P = 5$), Negatives ($N = 5$).


* Predict positive if $\hat{y} \ge T$.



| ID | Actual ($y$) | Prob ($\hat{y}$) | Pred ($T=0.7$) | Pred ($T=0.5$) | Pred ($T=0.3$) |
| --- | --- | --- | --- | --- | --- |
| 1 | 0 | 0.10 | 0 | 0 | 0 |
| 2 | 0 | 0.35 | 0 | 0 | 1 (FP) |
| 3 | 0 | 0.60 | 0 | 1 (FP) | 1 (FP) |
| 4 | 0 | 0.20 | 0 | 0 | 0 |
| 5 | 1 | 0.85 | 1 (TP) | 1 (TP) | 1 (TP) |
| 6 | 1 | 0.70 | 1 (TP) | 1 (TP) | 1 (TP) |
| 7 | 1 | 0.40 | 0 (FN) | 0 (FN) | 1 (TP) |
| 8 | 1 | 0.95 | 1 (TP) | 1 (TP) | 1 (TP) |
| 9 | 0 | 0.55 | 0 | 1 (FP) | 1 (FP) |
| 10 | 1 | 0.30 | 0 (FN) | 0 (FN) | 1 (TP) |

*At $T = 0.7$:* $TP = 3, FN = 2, FP = 0, TN = 5$.


$$\text{TPR} = \frac{3}{5} = 0.60, \quad \text{FPR} = \frac{0}{5} = 0.00 \implies \text{Point: } (0.0, 0.6)$$

*At $T = 0.5$:* $TP = 3, FN = 2, FP = 2, TN = 3$.


$$\text{TPR} = \frac{3}{5} = 0.60, \quad \text{FPR} = \frac{2}{5} = 0.40 \implies \text{Point: } (0.4, 0.6)$$

*At $T = 0.3$:* $TP = 5, FN = 0, FP = 3, TN = 2$.


$$\text{TPR} = \frac{5}{5} = 1.00, \quad \text{FPR} = \frac{3}{5} = 0.60 \implies \text{Point: } (0.6, 1.0)$$

*Boundary Points:*

* At $T = 0$: Everything predicted positive $\implies TP=5, FP=5 \implies (1.0, 1.0)$.


* At $T = 1$: Everything predicted negative $\implies TP=0, FP=0 \implies (0.0, 0.0)$.



Plot these points on a grid with FPR on the x-axis and TPR on the y-axis, connecting $(0,0) \to (0, 0.6) \to (0.4, 0.6) \to (0.6, 1.0) \to (1.0, 1.0)$.

---

#### E. k-NN and SMOTE Synthetic Generation by Hand

* **Minkowski Distance ($L_p$ norm):** $\text{Dis}_p(x, y) = \left(\sum_{j=1}^d \vert{}x_j - y_j\vert{}^p\right)^{1/p}$.


* $p = 1$: Manhattan (City-block) distance $= \sum \vert{}x_j - y_j\vert{}$.


* $p = 2$: Euclidean distance $= \sqrt{\sum (x_j - y_j)^2}$.


* $p = 0$: Hamming distance $= \sum \mathbb{I}[x_j \ne y_j]$ (mismatched dimensions/bits).




* **SMOTE Algorithm Steps (Paper-Level):**

1. Identify a minority class sample $x_i$.


2. Compute distances to all other minority instances to locate its $k$ nearest minority neighbors.


3. Select one of the $k$ neighbors at random, $x_{zi}$.


4. Compute the vector difference: $\text{diff} = x_{zi} - x_i$.


5. Generate synthetic instance using a random number $\lambda \in [0, 1]$:

$$x_{\text{new}} = x_i + \lambda \cdot (x_{zi} - x_i)$$






---

### 2. Gradient Descent & Math Intuition from First Principles

#### Terminology Disambiguation

* **Loss Function $L(y, \hat{y})$:** The penalty assigned to an individual training example for an incorrect prediction (e.g., squared error $(y_i - \hat{y}_i)^2$, 0–1 loss).


* **Cost Function $J(\theta)$:** The aggregate or average loss evaluated over the entire dataset (also referred to as empirical risk).



$$J(\theta) = \frac{1}{N}\sum_{i=1}^N L(y_i, f(x_i; \theta))$$



* **Objective Function:** The generalized scalar function that the optimization algorithm is designed to optimize. Can include both cost and regularization penalties, and can be framed as a minimization or maximization problem.



#### Deriving Linear Regression Gradients (MSE) via Chain Rule

Let the model hypothesis be $f(x_i; \theta) = \theta_0 + \theta_1 x_i$.
The cost function is:


$$J(\theta_0, \theta_1) = \frac{1}{N} \sum_{i=1}^{N} (y_i - (\theta_0 + \theta_1 x_i))^2$$

Let the loss for sample $i$ be $L_i = f(g(\theta))$, where $g = \theta_0 + \theta_1 x_i$ and $f(g) = (y_i - g)^2$.
By the chain rule:


$$\frac{\partial L_i}{\partial \theta_j} = \frac{df}{dg} \cdot \frac{\partial g}{\partial \theta_j}$$

$$\frac{df}{dg} = -2(y_i - g) = -2(y_i - (\theta_0 + \theta_1 x_i))$$

* **Partial derivative with respect to $\theta_0$** (where $\frac{\partial g}{\partial \theta_0} = 1$):



$$\frac{\partial J}{\partial \theta_0} = \frac{1}{N} \sum_{i=1}^N -2(y_i - (\theta_0 + \theta_1 x_i))$$



* **Partial derivative with respect to $\theta_1$** (where $\frac{\partial g}{\partial \theta_1} = x_i$):

$$\frac{\partial J}{\partial \theta_1} = \frac{1}{N} \sum_{i=1}^N -2x_i(y_i - (\theta_0 + \theta_1 x_i))$$



* **Parameter Update Rule:**

$$\theta_0 \leftarrow \theta_0 - \alpha \frac{\partial J}{\partial \theta_0}, \quad \theta_1 \leftarrow \theta_1 - \alpha \frac{\partial J}{\partial \theta_1}$$



* A positive gradient represents the direction of steepest ascent; subtracting the gradient scaled by learning rate $\alpha$ moves parameters toward steepest descent.





#### Gradient Descent Variants

* **Batch Gradient Descent:** Computes the gradient over the entire dataset ($N$ points) before taking a single update step. Computationally expensive per epoch on large data.


* **Stochastic Gradient Descent (SGD):** Updates parameters after each individual data sample ($N=1$). Fast and noisy, which helps escape saddle points.


* **Mini-Batch Gradient Descent:** Updates parameters after evaluating a subset (batch size $B < N$, e.g., 32 or 64). Balances computational efficiency with vectorization stability.



---

### 3. Classification Derivations & Model Fundamentals

#### Logistic Regression from MLE to Negative Log-Likelihood

* The logistic function squashes any real value into $[0, 1]$:



$$\sigma(z) = \frac{1}{1 + e^{-z}}, \quad \text{where } z = \theta^T x$$



* We model the probability of class 1 as:

$$p(y = 1 \mid x; \theta) = f(x), \quad p(y = 0 \mid x; \theta) = 1 - f(x)$$



* Combining into a single Bernoulli likelihood expression:



$$p(y \mid x; \theta) = f(x)^y (1 - f(x))^{1 - y}$$



* Assuming samples are independent and identically distributed (i.i.d.), the dataset likelihood is:



$$L(\theta) = \prod_{i=1}^N f(x_i)^{y_i}(1 - f(x_i))^{1 - y_i}$$



* Maximizing likelihood is equivalent to minimizing the **Negative Log-Likelihood (NLL / Binary Cross-Entropy)** to prevent underflow:



$$\text{NLL}(\theta) = -\ln L(\theta) = -\sum_{i=1}^N \left[ y_i \ln f(x_i) + (1 - y_i) \ln(1 - f(x_i)) \right]$$




#### Support Vector Machines (SVM)

* **Non-probabilistic Nature:** Unlike logistic regression (which models $p(y=1\vert{}x)$), SVM outputs a hard label based directly on the geometric margin: $f(x) = \text{sign}(w^T x + b) \in \{-1, +1\}$.


* **Optimization Objective:** Select the hyperplane that maximizes the margin $\frac{2}{\Vert{}w\Vert{}}$, which is equivalent to minimizing $\frac{1}{2}\Vert{}w\Vert{}^2$ subject to $y^{(i)}(w^T x^{(i)} + b) \ge 1$.


* **Soft-Margin SVM & Hinge Loss:** When data is not linearly separable, slack is allowed via Hinge Loss:



$$\min_{w, b} C \sum_{i=1}^n \max\left(0, 1 - y^{(i)}(w^T x^{(i)} + b)\right) + \frac{1}{2}\Vert{}w\Vert{}^2$$



* **$C$ Parameter:** Controls trade-off between margin size and misclassifications. Large $C$ heavily penalizes errors (smaller margin, higher variance, risk of overfitting). Small $C$ tolerates more errors for a wider margin (higher bias).




* **Kernel Trick:** Implicitly projects input vectors into higher-dimensional space where non-separable points become linearly separable, without computing explicit high-dimensional coordinates.



#### Multi-Class Strategies for Binary Classifiers (SVM)

* **One-vs-Rest (OvR / One-vs-All):** Train $K$ classifiers (each class against all other combined classes). Choose the class with the largest decision function value/margin.


* **One-vs-One (OvO):** Train $\frac{K(K - 1)}{2}$ binary classifiers for every pair of classes. Final prediction is decided by majority voting across all models.



---

### 4. Generalization, Features, & Evaluation Architectures

#### Bias-Variance Tradeoff & Regularization

* **Total Expected Test Error** decomposes into:

$$\text{Test Error} = \text{Bias}^2 + \text{Variance} + \text{Irreducible Error}$$



* **High Bias (Underfitting):** Model is overly rigid/constrained; fails to capture underlying patterns.


* **High Variance (Overfitting):** Model fits training data noise; high sensitivity to training variations, poor generalization.




* **Occam’s Razor:** Among competing hypotheses explaining observations equally well, select the simplest.


* **L1 Regularization (Lasso):** Penalty $\lambda \sum \vert{}\theta_i\vert{}$. Encourages sparsity by driving non-essential feature weights to zero, acting as automatic feature selection.


* **L2 Regularization (Ridge):** Penalty $\lambda \sum \theta_i^2$. Shrinks parameter weights uniformly toward zero without zeroing them out, yielding smoother decision boundaries.



#### Distance Models & Dimensionality

* **Neighbors vs. Exemplars:** An exemplar is a prototype representing a class (e.g., class centroid/mean). Nearest neighbors treat every sample in the training set as an exemplar. Partitioning space by nearest exemplars produces a **Voronoi tessellation**.


* **Curse of Dimensionality:** As dimensionality $d$ increases, volume grows exponentially, causing data to become sparse. Distance metrics (especially Euclidean) become less discriminative as distances between points converge, degrading k-NN performance.



#### Feature Engineering & Missing Data

* **Feature Types:** Nominal/Categorical (no natural order $\to$ One-Hot Encoding), Ordinal (meaningful rank $\to$ Integer Mapping / Binning), Numerical (Continuous values).


* **Missing Data Handling:** Deletion, Mean/Median/Mode imputation, or k-NN imputation. Always assess whether data is Missing Completely at Random (MCAR) or contains informative missingness (e.g., patients skipping stigmatized questions).



#### Class Imbalance & Baselines

* **Weak Baselines:**
* **Majority Class Baseline:** Always predicting the majority class. (If 85% of days have no snow, this baseline achieves 85% accuracy).


* **Random Baseline:** Randomly assigning predictions according to empirical class proportions:

$$\text{Expected Accuracy} = P(\text{class}_1)^2 + P(\text{class}_2)^2$$





* **Near-Miss Undersampling:** Keeps majority points closest to minority instances ("hard" boundary points), dropping far instances.


* **SMOTE Pros & Cons:**
* *Pros:* Balances distributions without duplicating samples; expands minority decision boundaries.


* *Cons:* Interpolating between noisy neighbors can create synthetic outliers inside majority regions, blurring decision margins.





#### Multi-Class Averaging Metrics

* **Macro-Average:** Calculate metric for each class independently; average equally ($\frac{1}{K}\sum M_k$). Gives equal importance to all classes regardless of size.


* **Weighted Average:** Weight each class metric by class support ($\sum \frac{N_k}{N} M_k$).


* **Micro-Average:** Pool global $TP, FP, FN$ across all classes before calculating the metric. Gives equal weight to every individual sample.



#### Pipeline Integrity & Leakage

* **Data Leakage:** Information from outside the training dataset used to create the model (e.g., fitting standardizers or running feature selection before the train/test split).


* **Temporal Leakage:** When data has a time component, using random splitting leaks future information into training. Use temporal block splitting instead.



---

### 5. Quick-Check Concept Review

| Question | Core Exam Concept |
| --- | --- |
| **Why is Logistic Regression called regression if it classifies?** | It fits a continuous linear regression function ($\theta^T x$) to log-odds before applying the sigmoid link function.

 |
| **Why does $k=1$ in k-NN have zero training error but high variance?** | Every training point is its own nearest neighbor ($Dis=0$), causing it to memorize training noise and overfit.

 |
| **Why is accuracy a poor metric for imbalanced problems?** | A naive baseline predicting only the majority class achieves deceptively high accuracy while missing all minority cases.

 |
| **Why is PCA math unneeded on the midterm?** | You only need to know that SVD decomposes $X = U\Sigma V^T$, where the right singular vectors ($V$) represent principal orthogonal directions of maximum variance.

 |
| **How does decision tree pruning work?** | Limits tree depth, sets minimum leaf counts, or requires a minimum impurity decrease to prevent leaves with single training samples.

 |

Mastering the calculation steps for Entropy/Gini, Normalization/Standardization, ROC thresholding, and the MSE gradient update will cover the majority of the written calculations on the exam.