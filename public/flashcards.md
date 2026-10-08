# CSI 5155: Machine Learning — Master Flashcard Deck
**Comprehensive Concept Inventory for Study & Game Engine Integration**
**Course:** CSI 5155 (Graduate Machine Learning, University of Ottawa)  
**Coverage:** Weeks 1–5 Slide Sets, Textbooks (Murphy, Flach, Bishop, Goodfellow), and Midterm Exam Problems

---

## SECTION 1: Week 1 — Foundations, Historical Arc, and Core Paradigms

### CARD 001
* **Topic:** Learning Paradigms
* **Category:** Core Taxonomy
* **Difficulty:** Easy
* **Front:** What is Tom Mitchell’s formal operational definition of Machine Learning?
* **Back:**
  A computer program is said to learn from **Experience ($E$)** with respect to some class of **Tasks ($T$)** and **Performance measure ($P$)**, if its performance at tasks in $T$, as measured by $P$, improves with experience $E$.
  * **$T$ (Task):** The operational goal (e.g., classification, regression, control).
  * **$E$ (Experience):** The data signal provided (e.g., labeled pairs, unlabeled feature vectors, reward signals).
  * **$P$ (Performance Measure):** The evaluation metric quantifying success (e.g., accuracy, mean squared error, win rate).

---

### CARD 002
* **Topic:** AI vs. ML vs. DL
* **Category:** Core Taxonomy
* **Difficulty:** Easy
* **Front:** Differentiate between Artificial Intelligence (AI), Machine Learning (ML), and Deep Learning (DL).
* **Back:**
  * **Artificial Intelligence (AI):** The overarching broad discipline covering any technique that enables machines to mimic human behavior or cognitive problem-solving (including symbolic AI and expert rule engines).
  * **Machine Learning (ML):** A subset of AI focusing on statistical methods that enable machines to improve performance at a task through experience without being explicitly hardcoded.
  * **Deep Learning (DL):** A specialized subset of ML centered on multi-layer artificial neural networks capable of learning hierarchical feature representations directly from raw or semi-raw inputs.

---

### CARD 003
* **Topic:** Learning Types
* **Category:** Problem Formulations
* **Difficulty:** Easy
* **Front:** Contrast Supervised, Unsupervised, and Reinforcement Learning by their Experience ($E$) and Objective ($T$).
* **Back:**
  * **Supervised Learning:** Experience consists of paired training instances $D = \{(x_n, y_n)\}_{n=1}^N$. The task is to learn an inductive mapping function $f: X \to Y$.
  * **Unsupervised Learning:** Experience consists of unlabeled instances $D = \{x_n\}_{n=1}^N$. The task is to model the input data distribution $p(x)$ or uncover latent geometric/statistical structures (clustering, dimensionality reduction, density estimation).
  * **Reinforcement Learning:** Experience consists of dynamic state-action-reward interactions $(s, a, r, s')$ with an environment. The task is to learn an optimal policy $\pi(s) \to a$ maximizing cumulative expected reward via trial and error.

---

### CARD 004
* **Topic:** Supervised Learning Terminology
* **Category:** Notation & Definitions
* **Difficulty:** Easy
* **Front:** In supervised learning, what are the formal synonyms for input variables ($X$) and output targets ($Y$)?
* **Back:**
  * **Inputs ($X$):** Features, Covariates, Predictors, Attributes, Independent Variables, or Regressors.
  * **Outputs ($Y$):** Targets, Labels, Responses, Outcomes, or Dependent Variables.
  * **Sample Size ($N$):** The total number of observed data instances in training dataset $D$.

---

### CARD 005
* **Topic:** AI Historical Arc
* **Category:** History & Milestones
* **Difficulty:** Medium
* **Front:** What caused the First and Second AI Winters?
* **Back:**
  * **First AI Winter (late 1960s–1970s):** Triggered by Marvin Minsky & Seymour Papert's 1969 book *Perceptrons*, which mathematically proved single-layer perceptrons could not solve non-linearly separable logic problems like XOR, collapsing connectionist research funding.
  * **Second AI Winter (late 1980s–1990s):** Caused by the commercial failure and extreme brittleness of rule-based "Expert Systems," which were difficult to maintain, incapable of generalizing to novel edge cases, and expensive to scale.

---

### CARD 006
* **Topic:** Modern AI Milestones
* **Category:** History & Milestones
* **Difficulty:** Medium
* **Front:** Name the key breakthrough associated with each of the following years: 1950, 1956, 1997, 2012, 2016, 2017.
* **Back:**
  * **1950:** Alan Turing introduces the Turing Test ("Can machines think?").
  * **1956:** Dartmouth Summer Workshop officially coins the term "Artificial Intelligence."
  * **1997:** IBM Deep Blue defeats world chess champion Garry Kasparov via heuristic tree search.
  * **2012:** AlexNet wins ImageNet, demonstrating the power of deep convolutional neural networks trained on GPUs.
  * **2016:** DeepMind's AlphaGo defeats Lee Sedol in Go using deep RL and Monte Carlo Tree Search.
  * **2017:** Vaswani et al. introduce the Transformer architecture based on self-attention mechanisms.

---

### CARD 007
* **Topic:** Modern Scaling Era
* **Category:** Advanced Foundations
* **Difficulty:** Hard
* **Front:** What is Rich Sutton's "The Bitter Lesson" (2019)?
* **Back:**
  The philosophical insight that 70 years of AI research proves **general methods that leverage massive computation (search and learning) consistently and overwhelmingly beat human-designed domain heuristics and handcrafted expert knowledge** in the long run.

---

### CARD 008
* **Topic:** Modern Scaling Era
* **Category:** Modern LLM Concepts
* **Difficulty:** Hard
* **Front:** What are "Scaling Laws" (Kaplan et al., 2020) and "Test-Time Compute"?
* **Back:**
  * **Scaling Laws:** Empirical power-law relationships demonstrating that language model cross-entropy loss drops predictably as compute budget, dataset token size, and parameter count scale up simultaneously.
  * **Test-Time Compute Scaling:** Increasing the inference-time computation budget (e.g., chain-of-thought search, tree-of-thought verification, self-consistency sampling) to boost reasoning accuracy on complex tasks without changing pre-trained parameters.

---

### CARD 009
* **Topic:** Statistical Foundations
* **Category:** Probability & Stats
* **Difficulty:** Medium
* **Front:** What is the fundamental difference between Probability and Statistics in Machine Learning?
* **Back:**
  * **Probability:** Operates forward from a **known underlying process/model** to predict the likelihood of observing future data outcomes.
  * **Statistics / Machine Learning:** Operates backward from **observed empirical data** to infer and parameterize the underlying data-generating process.

---

### CARD 010
* **Topic:** Exploratory Data Analysis
* **Category:** Statistics
* **Difficulty:** Medium
* **Front:** What does the "Datasaurus Dozen" illustrate about dataset statistics?
* **Back:**
  It proves that radically distinct geometric shapes and distributions (including a dinosaur, star, and concentric circles) can share **identical low-order summary statistics** (mean of $x$, mean of $y$, standard deviations, and Pearson correlation coefficient).
  * **Takeaway:** Never rely solely on summary numbers; always visualize raw data distributions before model fitting.

---

### CARD 011
* **Topic:** Computational Hardware
* **Category:** Linear Algebra
* **Difficulty:** Easy
* **Front:** Why do GPUs provide significant speedups over CPUs for training deep neural networks?
* **Back:**
  GPUs are massively parallel architectures designed to perform millions of simultaneous floating-point calculations across matrix operations (linear algebra tensor contractions: `X @ W`). CPUs execute instructions with low latency and sequential branches, making iterative loops over large datasets far slower than vectorized GPU tensor computations.

---

## SECTION 2: Week 2 — Regression, Classification, and Optimization

### CARD 012
* **Topic:** Linear Regression
* **Category:** Formulations
* **Difficulty:** Easy
* **Front:** State the mathematical formulation of simple and multivariate linear regression.
* **Back:**
  * **Simple Univariate:** $y = \theta_0 + \theta_1 x$ (where $\theta_0$ is intercept, $\theta_1$ is slope).
  * **Multivariate Vectorized:**
    $$y = \theta_0 + \sum_{j=1}^d \theta_j x_j = \theta^T x$$
    where a dummy feature $x_0 = 1$ is prepended so $x = [1, x_1, \dots, x_d]^T$ and parameter vector $\theta = [\theta_0, \theta_1, \dots, \theta_d]^T$.

---

### CARD 013
* **Topic:** Empirical Risk
* **Category:** Loss Functions
* **Difficulty:** Easy
* **Front:** Differentiate between a Loss function and a Cost function (Empirical Risk).
* **Back:**
  * **Loss Function $L(y_n, \hat{y}_n)$:** Measures the prediction penalty on a **single instance** (e.g., squared loss: $(y_n - \hat{y}_n)^2$).
  * **Cost Function $J(\theta)$:** The aggregate average loss evaluated over the **entire training dataset** of $N$ samples:
    $$J(\theta) = \text{MSE}(\theta) = \frac{1}{N} \sum_{n=1}^N (y_n - \theta^T x_n)^2$$

---

### CARD 014
* **Topic:** Optimization
* **Category:** Gradient Descent
* **Difficulty:** Medium
* **Front:** State the parameter update rule for Gradient Descent and define the gradient operator $\nabla$.
* **Back:**
  $$\theta \leftarrow \theta - \alpha \nabla_\theta J(\theta)$$
  * **$\nabla_\theta J(\theta)$ (Nabla):** The vector of partial derivatives $\left[\frac{\partial J}{\partial \theta_0}, \dots, \frac{\partial J}{\partial \theta_d}\right]^T$ pointing in the direction of **steepest ascent** on the loss surface. The negative sign drives steps toward the steepest descent.
  * **$\alpha$ (Learning Rate):** The scalar step size controlling how far parameters move per iteration.

---

### CARD 015
* **Topic:** Optimization
* **Category:** Gradient Descent
* **Difficulty:** Medium
* **Front:** What are the mathematical partial derivatives for Linear Regression Mean Squared Error?
* **Back:**
  For $J(\theta) = \frac{1}{N} \sum_{i=1}^N (y_i - (\theta_0 + \theta_1 x_i))^2$:
  * Intercept gradient:
    $$\frac{\partial J}{\partial \theta_0} = \frac{1}{N} \sum_{i=1}^N -2(y_i - (\theta_0 + \theta_1 x_i))$$
  * Slope gradient:
    $$\frac{\partial J}{\partial \theta_1} = \frac{1}{N} \sum_{i=1}^N -2 x_i (y_i - (\theta_0 + \theta_1 x_i))$$

---

### CARD 016
* **Topic:** Gradient Descent Variants
* **Category:** Optimization
* **Difficulty:** Medium
* **Front:** Compare Batch GD, Stochastic GD (SGD), and Mini-Batch GD.
* **Back:**
  * **Batch GD:** Computes exact gradient over all $N$ training examples before updating weights. Guaranteed smooth convergence on convex functions; very slow and memory-intensive for large datasets.
  * **Stochastic GD (SGD):** Updates weights immediately after evaluating each single training example ($N=1$). Highly computational efficient and escapes shallow local minima, but convergence path oscillates noisily.
  * **Mini-Batch GD:** Updates weights after evaluating a subset (batch) of size $B$ (e.g., $32 \le B \le 256$). Combines vectorization efficiency of GPUs with gradient smoothing.

---

### CARD 017
* **Topic:** Generalization
* **Category:** Model Capacity
* **Difficulty:** Medium
* **Front:** Define Model Capacity, Generalization Gap, and the i.i.d. Assumption.
* **Back:**
  * **Model Capacity:** The mathematical expressiveness or flexibility of a model family to fit diverse functions (e.g., higher-degree polynomial = higher capacity).
  * **Generalization Gap:** The absolute difference between training error and test error ($E_{\text{test}} - E_{\text{train}}$).
  * **i.i.d. Assumption:** The foundational postulate that training, validation, and test samples are **independent** and identically distributed from the **same** underlying distribution.

---

### CARD 018
* **Topic:** Generalization
* **Category:** Theoretical Error
* **Difficulty:** Hard
* **Front:** State the Bias-Variance Decomposition equation and describe each component.
* **Back:**
  $$\mathbb{E}[(y - \hat{f}(x))^2] = \text{Bias}[\hat{f}(x)]^2 + \text{Var}[\hat{f}(x)] + \sigma^2$$
  * **$\text{Bias}^2$:** Error due to oversimplified model assumptions (underfitting; model cannot capture true underlying relationship).
  * **$\text{Variance}$:** Error due to extreme model sensitivity to small fluctuations in training data (overfitting; model fits random sample noise).
  * **$\sigma^2$ (Irreducible Error):** Inherent stochastic noise in the data-generating process that cannot be eliminated by any model.

---

### CARD 019
* **Topic:** Regularization
* **Category:** Penalties
* **Difficulty:** Medium
* **Front:** Compare L1 (LASSO) and L2 (Ridge) Regularization.
* **Back:**
  * **L2 Regularization (Ridge):** Penalty term is $\lambda \sum_{j=1}^d \theta_j^2 = \lambda \|\theta\|_2^2$.
    * *Geometric Effect:* Circular/spherical constraint boundary.
    * *Behavior:* Shrinks all weight coefficients smoothly toward zero; prevents extreme weights; produces smooth, stable predictions.
  * **L1 Regularization (LASSO):** Penalty term is $\lambda \sum_{j=1}^d |\theta_j| = \lambda \|\theta\|_1$.
    * *Geometric Effect:* Diamond/polyhedral constraint boundary with sharp corners on axes.
    * *Behavior:* Drives non-essential weights strictly to zero, performing intrinsic feature selection and yielding **sparse models**.

---

### CARD 020
* **Topic:** Classification
* **Category:** Logistic Regression
* **Difficulty:** Medium
* **Front:** What is the Sigmoid (Logistic) function and why is it used in Logistic Regression?
* **Back:**
  $$\sigma(z) = \frac{1}{1 + e^{-z}}$$
  * **Role:** Acts as an activation/squashing function mapping real-valued linear logits $z = \theta^T x \in (-\infty, \infty)$ into a valid probability interval $[0, 1]$.
  * **Symmetry:** $\sigma(0) = 0.5$, $\sigma(-z) = 1 - \sigma(z)$, derivative $\sigma'(z) = \sigma(z)(1 - \sigma(z))$.

---

### CARD 021
* **Topic:** Classification
* **Category:** Loss Functions
* **Difficulty:** Hard
* **Front:** What is Negative Log-Likelihood (NLL) / Binary Cross-Entropy, and why can’t we use MSE for Logistic Regression?
* **Back:**
  $$\text{NLL}(\theta) = -\sum_{i=1}^N \left[ y_i \ln(f(x_i)) + (1 - y_i) \ln(1 - f(x_i)) \right]$$
  * **Why not MSE?** Passing a linear equation through the non-linear sigmoid into an MSE loss creates a **non-convex** error surface with numerous local minima and saddle points, causing gradient descent to stall. NLL maintains a guaranteed **convex** surface for logistic regression.

---

### CARD 022
* **Topic:** Support Vector Machines
* **Category:** Maximum Margin
* **Difficulty:** Medium
* **Front:** What is the Maximum Margin principle in Support Vector Machines (SVM)?
* **Back:**
  SVM finds the separating linear hyperplane that maximizes the geometric distance (the **margin**) between the decision boundary and the nearest data points of any class.
  * **Support Vectors:** The specific critical data points that lie directly on the margin boundaries ($w^T x + b = \pm 1$). Removing all non-support vector data points leaves the final decision boundary completely unchanged.

---

### CARD 023
* **Topic:** Support Vector Machines
* **Category:** Formulations
* **Difficulty:** Hard
* **Front:** Formulate the Soft-Margin SVM optimization problem and explain the role of hyperparameter $C$.
* **Back:**
  $$\min_{w, b} C \sum_{i=1}^n \max\left(0, 1 - y^{(i)}(w^T x^{(i)} + b)\right) + \frac{1}{2}\|w\|^2$$
  * Combines **Hinge Loss** with an **L2 weight regularizer**.
  * **Role of $C$ (Complexity Parameter):** Inversely proportional to regularization.
    * **Large $C$:** High penalty for errors $\to$ narrow margin, fits data strictly, risks overfitting.
    * **Small $C$:** Low penalty for errors $\to$ wider margin, tolerates boundary violations, higher regularization.

---

### CARD 024
* **Topic:** Support Vector Machines
* **Category:** Non-linear Modeling
* **Difficulty:** Hard
* **Front:** Explain the "Kernel Trick" in SVM.
* **Back:**
  A mathematical technique allowing an SVM to learn non-linear boundaries by mapping input data into a higher-dimensional feature space $\phi(x)$ where the data becomes linearly separable, **without ever explicitly computing coordinates in that high-dimensional space**.
  * It computes inner products via a kernel function: $K(x_i, x_j) = \langle\phi(x_i), \phi(x_j)\rangle$.
  * **Standard Kernels:** Linear, Polynomial ($(\gamma x^T x' + r)^d$), Radial Basis Function / Gaussian RBF ($\exp(-\gamma \|x - x'\|^2)$).

---

### CARD 025
* **Topic:** Multi-Class Strategies
* **Category:** Architectures
* **Difficulty:** Medium
* **Front:** Compare Softmax Regression, One-vs-All (OvA), and One-vs-One (OvO) for $K$ classes.
* **Back:**
  * **Softmax Regression:** Single native multi-class probabilistic model normalizing class logits:
    $$P(y = i | x) = \frac{e^{\theta_i^T x}}{\sum_{j=1}^K e^{\theta_j^T x}}$$
  * **One-vs-All (OvA / OvR):** Trains $K$ binary classifiers (Class $k$ vs. Rest). Evaluates all $K$; prediction is the class with highest decision margin/probability.
  * **One-vs-One (OvO):** Trains $\frac{K(K-1)}{2}$ pairwise binary classifiers. Every classifier votes; prediction is the class winning the plurality vote.

---

## SECTION 3: Week 3 — Decision Trees, Distance-Based Models, Features, and Imbalanced Data

### CARD 026
* **Topic:** Model Typologies
* **Category:** Definitions
* **Difficulty:** Medium
* **Front:** Define Parametric vs. Non-Parametric models and classify: Linear Regression, Logistic Regression, Decision Trees, k-NN, and SVM.
* **Back:**
  * **Parametric:** Assumes a fixed functional form with a finite set of parameters independent of training sample size $N$ (Training data can be discarded after fitting).
    * *Examples:* Linear Regression ($\theta \in \mathbb{R}^{d+1}$), Logistic Regression ($\theta \in \mathbb{R}^{d+1}$).
  * **Non-Parametric:** Makes no strong functional form assumptions; model capacity and effective parameters grow with dataset size $N$.
    * *Examples:* Decision Trees (nodes grow with data), k-NN (keeps entire dataset), SVM (support vectors scale with dataset size and complexity).

---

### CARD 027
* **Topic:** Decision Trees
* **Category:** Splitting Algorithms
* **Difficulty:** Medium
* **Front:** Explain the recursive `GrowTree` divide-and-conquer logic in CART.
* **Back:**
  1. Check if dataset $D$ at current node satisfies `Homogeneous(D)` (e.g., pure class, min samples reached). If true, return leaf node with `Label(D)` (majority class).
  2. Otherwise, find optimal split literal $S = \text{BestSplit}(D, F)$ evaluating impurity across all features $F$.
  3. Partition $D$ into disjoint subsets $D_i$ based on literals in $S$.
  4. Recursively call `GrowTree`($D_i, F$) for each subset to form child subtrees.

---

### CARD 028
* **Topic:** Decision Trees
* **Category:** Impurity Metrics
* **Difficulty:** Hard
* **Front:** State the formulas for Gini Impurity, Shannon Entropy, and Information Gain.
* **Back:**
  * **Gini Impurity:**
    $$G = \sum_{c=1}^C p(c)(1 - p(c)) = 1 - \sum_{c=1}^C p(c)^2 \quad (\text{Binary: } 2p(1)(1 - p(1)))$$
  * **Shannon Entropy:**
    $$H(Y) = -\sum_{c=1}^C p(c) \log_2 p(c)$$
  * **Information Gain ($IG$):**
    $$IG = H_{\text{parent}} - H_{\text{split}} = H(D) - \sum_{k} \frac{|D_k|}{|D|} H(D_k)$$

---

### CARD 029
* **Topic:** Decision Trees
* **Category:** Regularization / Pruning
* **Difficulty:** Easy
* **Front:** Name four hyperparameters used to prevent overfitting (pruning) in Decision Trees.
* **Back:**
  1. **Maximum Depth (`max_depth`):** Hard limit on root-to-leaf path length.
  2. **Minimum Samples per Split (`min_samples_split`):** Minimum samples required at an internal node before a split is evaluated.
  3. **Minimum Samples per Leaf (`min_samples_leaf`):** Minimum samples that must remain in any generated leaf node.
  4. **Minimum Impurity Decrease (`min_impurity_decrease`):** Split occurs only if impurity drop exceeds threshold $\Delta I$.

---

### CARD 030
* **Topic:** Distance Metrics
* **Category:** Metric Spaces
* **Difficulty:** Medium
* **Front:** Define Minkowski Distance of order $p$, and state formulas for $p=2$, $p=1$, and $p=0$.
* **Back:**
  $$Dis_p(x, y) = \left( \sum_{j=1}^d |x_j - y_j|^p \right)^{1/p}$$
  * **$p = 2$ (Euclidean Distance / $L_2$ norm):** Straight-line coordinate distance $\sqrt{\sum (x_j - y_j)^2}$.
  * **$p = 1$ (Manhattan Distance / $L_1$ norm):** City-block grid distance $\sum |x_j - y_j|$.
  * **$p = 0$ (Hamming Distance):** Number of mismatching attributes/bits $\sum \mathbb{I}[x_j \neq y_j]$.

---

### CARD 031
* **Topic:** Distance Metrics
* **Category:** Mathematical Axioms
* **Difficulty:** Hard
* **Front:** What four mathematical properties must a function satisfy to be a formal Distance Metric? What is a Pseudo-Metric?
* **Back:**
  For all $x, y, z \in \mathcal{X}$:
  1. **Non-negativity & Identity:** $Dis(x, x) = 0$; if $x \ne y$ then $Dis(x, y) > 0$.
  2. **Symmetry:** $Dis(x, y) = Dis(y, x)$.
  3. **Triangle Inequality:** $Dis(x, z) \le Dis(x, y) + Dis(y, z)$.
  * **Pseudo-Metric:** Relaxes strict positivity, allowing $Dis(x, y) = 0$ even when $x \ne y$.

---

### CARD 032
* **Topic:** Distance Metrics
* **Category:** Text & Embeddings
* **Difficulty:** Medium
* **Front:** What is Cosine Distance and when is it preferred over Euclidean Distance?
* **Back:**
  $$\text{Cosine Similarity} = \frac{A \cdot B}{\|A\|_2 \|B\|_2} = \cos(\theta), \quad \text{Cosine Distance} = 1 - \text{Cosine Similarity}$$
  * **Preference:** Measures the **angular orientation** rather than vector magnitude. Preferred in text analysis, NLP word embeddings, and document TF-IDF spaces where document length (vector magnitude) should not obscure semantic similarity.

---

### CARD 033
* **Topic:** Distance-Based Models
* **Category:** Nearest Neighbors
* **Difficulty:** Medium
* **Front:** How does k-NN classify a query point? What is the impact of hyperparameter $k$?
* **Back:**
  * **Mechanism:** Identifies the $k$ training points closest to test vector $x^*$ under metric $Dis(x^*, x_i)$, returning the plurality class label among them.
  * **$k = 1$:** High variance / low bias; flexible, complex decision boundary; highly sensitive to noise and outliers.
  * **Large $k$:** Low variance / high bias; smooth, stable decision boundary; risks blurring fine boundaries and being overwhelmed by majority class priors.

---

### CARD 034
* **Topic:** High-Dimensional Data
* **Category:** Geometric Theory
* **Difficulty:** Hard
* **Front:** What is the "Curse of Dimensionality" and how does it degrade k-NN?
* **Back:**
  As feature dimension $d$ increases:
  1. The volume of the feature space grows exponentially ($V \propto r^d$), causing severe data sparsity (space is mostly empty).
  2. The distance between any point and its nearest neighbor approaches the distance to its furthest neighbor ($\lim_{d\to\infty} \frac{D_{\max} - D_{\min}}{D_{\min}} \to 0$).
  * **Result for k-NN:** Euclidean distance loses discriminative meaning because all neighbors become approximately equidistant.

---

### CARD 035
* **Topic:** Feature Engineering
* **Category:** Data Typologies
* **Difficulty:** Easy
* **Front:** Define Categorical (Nominal), Ordinal, and Numerical features, with examples.
* **Back:**
  * **Categorical (Nominal):** Unordered discrete categories (e.g., Blood Type: A, B, AB, O; Country: Canada, USA). Encoded via One-Hot vectors.
  * **Ordinal:** Discrete categories possessing a meaningful rank order, but intervals between values are unknown or non-uniform (e.g., Education: High School < BSc < MSc < PhD; Survey: Poor < Fair < Good).
  * **Numerical (Quantitative):** Continuous or count variables where both order and differences carry exact mathematical meaning (e.g., Temperature, House Price, Age).

---

### CARD 036
* **Topic:** Data Preprocessing
* **Category:** Feature Scaling
* **Difficulty:** Medium
* **Front:** Compare Min-Max Normalization and Z-Score Standardization. State the Data Contamination Rule.
* **Back:**
  * **Min-Max Normalization:** $\bar{x} = \frac{x - \min(x)}{\max(x) - \min(x)} \in [0, 1]$. Highly sensitive to extreme outliers.
  * **Z-Score Standardization:** $\hat{x} = \frac{x - \mu}{\sigma}$ (centers at $\mu=0$ with $\sigma=1$). Robust to outliers; retains unbounded range.
  * **Contamination Rule:** Scaler parameters ($\mu, \sigma, \min, \max$) **must be computed strictly on the training partition**, and applied forward to validation and test data without recomputing.

---

### CARD 037
* **Topic:** Missing Data
* **Category:** Imputation
* **Difficulty:** Medium
* **Front:** Compare Global Mean, Class-Conditional Mean, and k-NN Imputation. Which cannot be used at test inference?
* **Back:**
  * **Global Mean:** Replaces missing feature with the overall average of observed values across the entire dataset.
  * **Class-Conditional Mean:** Replaces missing feature with the average computed exclusively over samples possessing the **same class label**.
    * *Inference Restriction:* **Class-conditional cannot be used at test time** because test labels are unknown during inference!
  * **k-NN Imputation:** Replaces missing value with the mean of the $k$-nearest neighbors computed across observed non-missing features.

---

### CARD 038
* **Topic:** Feature Selection
* **Category:** Methods Comparison
* **Difficulty:** Hard
* **Front:** Compare Filter, Wrapper, and Embedded methods for feature selection.
* **Back:**
  * **Filter Methods:** Evaluates feature importance independently of model learning using statistical metrics (Pearson correlation, mutual information, ANOVA $F$-test). Fast, but ignores feature interactions.
  * **Wrapper Methods:** Evaluates feature subsets by training a learning algorithm iteratively (Forward Selection: start empty, add best; Backward Elimination: start full, drop worst; Recursive Feature Elimination/RFE). Accurate, but computationally expensive.
  * **Embedded Methods:** Feature selection occurs naturally during training as part of the optimization algorithm (e.g., L1 LASSO zeroing out weights; Decision Tree split selection).

---

### CARD 039
* **Topic:** Dimensionality Reduction
* **Category:** PCA & SVD
* **Difficulty:** Hard
* **Front:** Explain how Singular Value Decomposition (SVD) computes Principal Component Analysis (PCA).
* **Back:**
  For centered/standardized data matrix $X$ ($n \times d$):
  $$X = U \Sigma V^T$$
  * **$U$ ($n \times n$):** Left singular vectors (orthonormal basis for data rows).
  * **$\Sigma$ ($n \times d$):** Diagonal matrix containing singular values $\sigma_1 \ge \sigma_2 \ge \dots$ quantifying explained variance.
  * **$V^T$ ($d \times d$):** Right singular vectors (the **principal component directions/loadings**).
  * **Low-Rank Projection ($k < d$):** Retaining top $k$ singular values gives reduced dataset:
    $$Z = U_k \Sigma_k = X V_k \quad (n \times k)$$

---

### CARD 040
* **Topic:** Class Imbalance
* **Category:** Sampling Methods
* **Difficulty:** Hard
* **Front:** Explain SMOTE and Near-Miss sampling. Where in the ML pipeline must sampling occur?
* **Back:**
  * **SMOTE (Synthetic Minority Over-sampling Technique):** Synthesizes new minority instances by randomly selecting a minority sample $x$, finding its $k$-nearest minority neighbors, picking one neighbor $x_{zi}$, and interpolating along the vector segment: $x_{\text{new}} = x + \lambda(x_{zi} - x)$ for $\lambda \in [0, 1]$.
  * **Near-Miss Undersampling:** Keeps majority instances that have the smallest distance to minority instances (preserving critical decision boundary points).
  * **Pipeline Rule:** Sampling **must only be applied to the training set**. The validation and test sets must maintain original natural class priors to avoid evaluation distortion.

---

## SECTION 4: Week 4 — ML Pipelines, Baselines, and Evaluation Metrics

### CARD 041
* **Topic:** Dataset Partitioning
* **Category:** Pipeline Design
* **Difficulty:** Easy
* **Front:** Define the unique role of Training, Validation, and Test datasets.
* **Back:**
  * **Training Set:** Used directly by the learning algorithm to fit internal model parameters (e.g., linear weights $\theta$, tree splits).
  * **Validation Set (Dev Set):** Used to tune hyperparameters (e.g., $C, \lambda, k$, depth), perform model selection, and establish early stopping to prevent overfitting.
  * **Test Set:** A strictly held-out partition evaluated **only once** at the very end to measure unbiased final generalization performance on unseen data.

---

### CARD 042
* **Topic:** Resampling Validation
* **Category:** Cross-Validation
* **Difficulty:** Medium
* **Front:** How does $K$-Fold Cross-Validation operate, and what is Leave-One-Out (LOO) CV?
* **Back:**
  * **$K$-Fold CV:** Partitions training data into $K$ equal disjoint folds. Iteratively runs $K$ trials: in each trial, trains on $K-1$ folds and validates on the remaining 1 fold. Final score is the average performance across all $K$ validation runs.
  * **Leave-One-Out (LOO) CV:** The extreme limit of $K$-fold where $K = N$. The model is trained on $N-1$ points and evaluated on the single remaining point, repeated $N$ times. Computationally heavy, deterministic, low bias, but high variance.

---

### CARD 043
* **Topic:** Data Leakage
* **Category:** Pipeline Hazards
* **Difficulty:** Hard
* **Front:** Define Data Leakage and identify three common pipeline mechanisms that cause it.
* **Back:**
  * **Definition:** Spurious sharing of information from outside the training set into the model construction process, producing overly optimistic validation results that collapse in real deployment.
  * **Mechanisms:**
    1. **Preprocessing Leakage:** Normalizing, standardizing, or selecting features on the full dataset before splitting into train/test.
    2. **Temporal Leakage:** Randomly shuffling time-dependent data (e.g., stock prices, vulnerability CVEs) such that future events train predictions of past events.
    3. **Group/Subject Leakage:** Splitting repeated observations from the same patient, device, or user across both training and test sets.

---

### CARD 044
* **Topic:** Baseline Evaluation
* **Category:** Benchmarks
* **Difficulty:** Medium
* **Front:** Define the Majority Class Baseline and Random Baseline. Calculate accuracy for a dataset with 80% Class A and 20% Class B.
* **Back:**
  * **Majority Class Baseline:** Always predicts the most frequent class.
    * *Calculation:* Accuracy = $80\% = 0.80$.
  * **Random Baseline:** Predicts classes according to their empirical probability distribution.
    * *Calculation:*
      $$\text{Acc} = P(A)P(\text{pred } A) + P(B)P(\text{pred } B) = (0.80)(0.80) + (0.20)(0.20) = 0.64 + 0.04 = 68\% = 0.68$$
  * Any useful ML model must significantly beat both baselines!

---

### CARD 045
* **Topic:** Confusion Matrix
* **Category:** Evaluation Metrics
* **Difficulty:** Easy
* **Front:** Define True Positive (TP), False Positive (FP), False Negative (FN), and True Negative (TN).
* **Back:**
  * **True Positive (TP):** Ground truth is Positive; model correctly predicts Positive.
  * **False Positive (FP / Type I Error):** Ground truth is Negative; model incorrectly predicts Positive ("false alarm").
  * **False Negative (FN / Type II Error):** Ground truth is Positive; model incorrectly predicts Negative ("missed diagnosis").
  * **True Negative (TN):** Ground truth is Negative; model correctly predicts Negative.

---

### CARD 046
* **Topic:** Evaluation Metrics
* **Category:** Classification
* **Difficulty:** Medium
* **Front:** State the formulas for Precision, Recall (TPR), Specificity (TNR), and FPR.
* **Back:**
  * **Precision:** $\frac{\text{TP}}{\text{TP} + \text{FP}}$ (proportion of positive calls that are correct).
  * **Recall (Sensitivity / TPR):** $\frac{\text{TP}}{\text{TP} + \text{FN}}$ (proportion of actual positives captured).
  * **Specificity (TNR):** $\frac{\text{TN}}{\text{TN} + \text{FP}}$ (proportion of actual negatives captured).
  * **False Positive Rate (FPR):** $\frac{\text{FP}}{\text{FP} + \text{TN}} = 1 - \text{Specificity}$.

---

### CARD 047
* **Topic:** Evaluation Metrics
* **Category:** Classification Trade-offs
* **Difficulty:** Medium
* **Front:** Explain the Precision-Recall Trade-off and define the F1 Score.
* **Back:**
  * **Trade-off:**
    * Predicting Positive for *all instances* yields **$\text{Recall} = 1.0$**, but **Precision drops** due to massive False Positives.
    * Predicting Positive *only for the single most confident instance* yields **$\text{Precision} = 1.0$**, but **Recall drops** due to massive False Negatives.
  * **F1 Score:** The harmonic mean of Precision and Recall, heavily penalizing models where either metric collapses:
    $$F_1 = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}} = \frac{2\text{TP}}{2\text{TP} + \text{FP} + \text{FN}}$$

---

### CARD 048
* **Topic:** Evaluation Metrics
* **Category:** Threshold Independent
* **Difficulty:** Hard
* **Front:** What is an ROC Curve and AUROC? What do AUROC values of 1.0, 0.5, and <0.5 signify?
* **Back:**
  * **ROC (Receiver Operating Characteristic) Curve:** Plots True Positive Rate (Recall) on the $y$-axis against False Positive Rate on the $x$-axis across all possible classification decision thresholds $\tau \in [0, 1]$.
  * **AUROC (Area Under ROC):** The area under the ROC curve, measuring aggregate discrimination ability independent of threshold.
    * **AUROC = 1.0:** Perfect classifier.
    * **AUROC = 0.5:** Random guessing performance (diagonal line).
    * **AUROC < 0.5:** Worse than random; indicates inverted class labels.

---

### CARD 049
* **Topic:** Multi-Class Evaluation
* **Category:** Averaging Metrics
* **Difficulty:** Hard
* **Front:** Compare Macro-average, Weighted-average, and Micro-average in multi-class classification.
* **Back:**
  * **Macro-Average:** Computes the metric independently for each class and takes the unweighted arithmetic mean: $\frac{1}{K}\sum M_k$. Treats all classes equally, penalizing poor performance on rare classes.
  * **Weighted-Average:** Computes the metric per class and weights each by class support (sample count $N_k$): $\sum \frac{N_k}{N} M_k$.
  * **Micro-Average:** Sums global $\text{TP}, \text{FP}, \text{FN}$ across all classes before calculating the metric: $\frac{\sum \text{TP}_k}{\sum \text{TP}_k + \sum \text{FP}_k}$. Treats every individual sample equally (for Precision and Recall, Micro-Average equals overall Accuracy).

---

### CARD 050
* **Topic:** Regression Evaluation
* **Category:** Error Metrics
* **Difficulty:** Easy
* **Front:** State the formulas for Mean Squared Error (MSE), Root Mean Squared Error (RMSE), and Mean Absolute Error (MAE).
* **Back:**
  * **Mean Squared Error (MSE):** $\frac{1}{n} \sum_{i=1}^n (y_i - \hat{y}_i)^2$ (penalizes large outlier errors quadratically).
  * **Root Mean Squared Error (RMSE):** $\sqrt{\text{MSE}}$ (in original units of target variable $y$).
  * **Mean Absolute Error (MAE):** $\frac{1}{n} \sum_{i=1}^n |y_i - \hat{y}_i|$ (linear penalty, robust to outliers).

---

## SECTION 5: Week 5 — Unsupervised, Semi-Supervised, Active Learning, and Ensembles

### CARD 051
* **Topic:** Unsupervised Learning
* **Category:** Clustering
* **Difficulty:** Medium
* **Front:** How does Hierarchical Agglomerative Clustering (HAC) work, and what is a Dendrogram?
* **Back:**
  * **HAC:** A bottom-up clustering algorithm. Starts with $N$ individual single-point clusters. Iteratively computes pairwise cluster distances and merges the two closest clusters, repeating until all points belong to a single root cluster.
  * **Dendrogram:** A tree diagram showing the complete sequence and distances of nested cluster merges. Cutting horizontally at a chosen distance threshold defines flat cluster assignments.

---

### CARD 052
* **Topic:** Hierarchical Clustering
* **Category:** Linkage Criteria
* **Difficulty:** Hard
* **Front:** Compare Single Linkage, Complete Linkage, and Average Linkage in HAC.
* **Back:**
  * **Single Linkage (Nearest Neighbors):** Distance between groups $G, H$ is the distance between their closest members:
    $$d_{\text{SL}}(G, H) = \min_{i \in G, j \in H} d(i, j)$$
    * *Behavior:* Susceptible to "chaining" artifacts (long, straggly clusters).
  * **Complete Linkage (Furthest Neighbors):** Distance is between the most distant pair:
    $$d_{\text{CL}}(G, H) = \max_{i \in G, j \in H} d(i, j)$$
    * *Behavior:* Forces compact, spherical clusters.
  * **Average Linkage:** Average distance between all cross-group pairs:
    $$d_{\text{avg}}(G, H) = \frac{1}{|G||H|} \sum_{i \in G} \sum_{j \in H} d(i, j)$$

---

### CARD 053
* **Topic:** Unsupervised Learning
* **Category:** K-Means
* **Difficulty:** Medium
* **Front:** Detail the step-by-step algorithm of K-Means Clustering and state its primary limitations.
* **Back:**
  * **Algorithm:**
    1. Choose $K$; randomly initialize $K$ centroid vectors $\mu_1, \dots, \mu_K$.
    2. **Assignment Step:** Assign each point $x_i$ to its closest centroid: $\arg\min_j \|x_i - \mu_j\|_2$.
    3. **Update Step:** Recompute each centroid as the arithmetic mean of its assigned cluster: $\mu_j = \frac{1}{|D_j|}\sum_{x \in D_j} x$.
    4. Repeat steps 2–3 until centroids stabilize (no assignment changes).
  * **Limitations:** Sensitive to random initialization (converges to local minima; requires multiple restarts); user must specify $K$ a priori; struggles with non-spherical clusters.

---

### CARD 054
* **Topic:** Cluster Validation
* **Category:** Silhouette Analysis
* **Difficulty:** Hard
* **Front:** Define Intra-cluster distance ($a_i$), Nearest-cluster distance ($b_i$), and the Silhouette Score formula.
* **Back:**
  * **$a_i$ (Intra-cluster distance):** Mean distance from point $i$ to all other points within its own cluster $C_i$ (Cohesion; lower is better):
    $$a_i = \frac{1}{|C_i| - 1} \sum_{j \in C_i, j \ne i} d(i, j)$$
  * **$b_i$ (Nearest-cluster distance):** Mean distance from point $i$ to points in the closest neighboring cluster $C$ (Separation; higher is better):
    $$b_i = \min_{C \ne C_i} \frac{1}{|C|} \sum_{k \in C} d(i, k)$$
  * **Silhouette Score ($s_i$):**
    $$s_i = \frac{b_i - a_i}{\max(a_i, b_i)} \in [-1, +1]$$
    * $+1 \to$ well-clustered; $0 \to$ on boundary; $-1 \to$ misassigned.

---

### CARD 055
* **Topic:** Semi-Supervised Learning
* **Category:** Core Assumptions
* **Difficulty:** Hard
* **Front:** Name and define the three foundational assumptions that enable Semi-Supervised Learning (SSL).
* **Back:**
  1. **Smoothness Assumption:** Points that are close to each other in high-density regions of input space share the same label (applies transitively across clusters).
  2. **Low-Density Assumption:** The optimal decision boundary should pass through low-density regions (sparse gaps between clusters) rather than cutting through dense clusters.
  3. **Manifold Assumption:** High-dimensional data concentrates near lower-dimensional sub-manifolds; points lying on the same underlying manifold share the same class label.

---

### CARD 056
* **Topic:** Semi-Supervised Learning
* **Category:** Inductive vs. Transductive
* **Difficulty:** Medium
* **Front:** Distinguish between Inductive and Transductive Semi-Supervised Learning.
* **Back:**
  * **Inductive SSL:** Aims to learn a generalized predictive mapping function $f: X \to Y$ capable of predicting labels for **unseen future test instances**.
  * **Transductive SSL:** Aims strictly to predict labels for the specific **unlabeled instances $D_U$ already present in the training set**, without producing a general classifier for future data.

---

### CARD 057
* **Topic:** Semi-Supervised Learning
* **Category:** Wrapper Methods
* **Difficulty:** Hard
* **Front:** Contrast Self-Training and Co-Training wrapper methods.
* **Back:**
  * **Self-Training:** A single supervised classifier trains on labeled data $D_L$, predicts labels on unlabeled pool $D_U$, appends its most confident pseudo-labeled samples to $D_L$, and iteratively retrains itself.
  * **Co-Training:** Employs two or more distinct classifiers trained on **independent, redundant feature views** of the data (e.g., audio view and text view). Each classifier adds its most confident predictions into the other classifier's training set, correcting each other's errors.

---

### CARD 058
* **Topic:** Active Learning
* **Category:** Query Strategies
* **Difficulty:** Hard
* **Front:** Define Active Learning and explain three Uncertainty Sampling strategies: Least Confident, Margin, and Entropy.
* **Back:**
  * **Active Learning:** A paradigm where the learning algorithm actively selects which informative unlabeled instances to send to an Oracle (human annotator) for ground-truth labeling.
  * **Uncertainty Strategies:**
    1. **Least Confident:** Queries instance with smallest maximum predicted probability: $\arg\min_x \max_c P(y=c|x)$.
    2. **Margin Sampling:** Queries instance with smallest probability gap between top-2 predicted classes: $\arg\min_x (P(y_{(1)}|x) - P(y_{(2)}|x))$.
    3. **Entropy Sampling:** Queries instance with maximum Shannon entropy across full class distribution: $\arg\max_x \left(-\sum_k p_k \log_2 p_k\right)$.

---

### CARD 059
* **Topic:** Ensemble Learning
* **Category:** Foundations
* **Difficulty:** Medium
* **Front:** What is the foundational requirement for an Ensemble of models to outperform a single model?
* **Back:**
  The constituent base models must make **independent, uncorrelated errors** while achieving performance better than random guessing. When errors are uncorrelated, individual mistakes are canceled out by the collective majority vote or average.

---

### CARD 060
* **Topic:** Ensemble Learning
* **Category:** Bagging vs. Boosting
* **Difficulty:** Hard
* **Front:** Compare Bagging and Boosting in terms of base learners, sequence, and bias/variance reduction.
* **Back:**
  * **Bagging (Bootstrap Aggregating):**
    * *Base Learners:* High-variance, low-bias models (e.g., deep unpruned trees).
    * *Training Sequence:* Parallel and independent on bootstrap samples (sampling with replacement).
    * *Primary Effect:* **Reduces Variance** significantly without increasing bias.
  * **Boosting:**
    * *Base Learners:* High-bias, low-variance models ("weak learners", e.g., shallow decision stumps).
    * *Training Sequence:* Sequential; each model corrects errors of prior models.
    * *Primary Effect:* **Reduces Bias** systematically, creating an expressive model.

---

### CARD 061
* **Topic:** Ensemble Learning
* **Category:** Random Forest
* **Difficulty:** Medium
* **Front:** What two mechanisms of randomness decorrelate trees in a Random Forest? State the feature subspace rule of thumb.
* **Back:**
  1. **Bootstrapping (Bagging):** Each tree trains on a distinct random sample drawn with replacement from the training set.
  2. **Random Feature Subspaces:** At every split node, the tree is forced to choose the best split from a randomly selected subset of features of size $d$.
  * **Rule of Thumb:** $d = \lfloor\sqrt{\text{total features}}\rfloor$ for classification (e.g., $\sqrt{20} \approx 4\text{–}5$ features).

---

### CARD 062
* **Topic:** Ensemble Learning
* **Category:** AdaBoost Mechanics
* **Difficulty:** Hard
* **Front:** State the AdaBoost algorithm: sample weight updates, error rate $\epsilon_m$, and model weight $\alpha_m$.
* **Back:**
  * **Initialization:** Uniform sample weights $w_n = 1/N$.
  * **Weighted Error:** $\epsilon_m = \sum_{n: f_m(x_n) \ne y_n} w_n$.
  * **Model Weight:** $\alpha_m = \frac{1}{2} \ln\left(\frac{1 - \epsilon_m}{\epsilon_m}\right)$ (higher accuracy $\to$ higher vote weight).
  * **Weight Update:**
    * Misclassified samples: $w_n \leftarrow w_n \cdot e^{\alpha_m}$ (increased).
    * Correctly classified: $w_n \leftarrow w_n \cdot e^{-\alpha_m}$ (decreased).
    * Renormalize so $\sum w_n = 1$.
  * **Aggregation:** Final prediction is weighted sum $\text{Pred}(x) = \text{sign}\left(\sum_{m=1}^M \alpha_m f_m(x)\right)$.

---

### CARD 063
* **Topic:** Ensemble Learning
* **Category:** Gradient Boosting
* **Difficulty:** Hard
* **Front:** How does Gradient Boosting build an ensemble for regression? What is a pseudo-residual?
* **Back:**
  1. Initialize with constant prediction $f_0(x) = \bar{y}$ (dataset mean).
  2. For iteration $m = 1 \dots M$:
     * Compute residuals for each point: $r_{n} = y_n - f_{m-1}(x_n)$.
     * Train a new weak learner $h_m(x)$ to predict the **residuals** $(x_n, r_n)$ directly (not original target $y$).
     * Additively update ensemble: $f_m(x) = f_{m-1}(x) + \alpha \cdot h_m(x)$ (where $\alpha$ is shrinkage / learning rate).
  * **Pseudo-Residual:** The negative gradient of the loss function with respect to the current model prediction: $-\left[\frac{\partial L(y, f(x))}{\partial f(x)}\right]$. For squared loss, this equals $y - f(x)$.

---

### CARD 064
* **Topic:** Ensembles Comparison
* **Category:** Comparison Table
* **Difficulty:** Hard
* **Front:** Contrast AdaBoost and Gradient Boosting across: target predicted, combination rule, and outlier sensitivity.
* **Back:**
  | Property | AdaBoost | Gradient Boosting |
  | :--- | :--- | :--- |
  | **What each model predicts** | Original class labels | Target errors / residuals |
  | **What changes between rounds** | Sample weights on data points | Targets data is trained on |
  | **How models are combined** | Weighted vote ($\alpha_m$ per model) | Scaled additive sum ($\alpha \cdot h_m$) |
  | **Outlier/Noise Sensitivity** | **High** (exponential penalty on hard points) | **Medium** (can use robust loss like Huber/MAE) |
  | **Modern Implementations** | `AdaBoostClassifier` | XGBoost, LightGBM, CatBoost |

---

## SECTION 6: Midterm Exam — Numerical Calculations & Applied Problem Archetypes

### CARD 065
* **Topic:** Midterm Practice Q1
* **Category:** Classification
* **Difficulty:** Easy
* **Front:** Categorize the following as Supervised (S) or Unsupervised (U):
  1. Parameter optimization for Linear Regression.
  2. Applying K-Means to group customer purchases.
  3. Hierarchical agglomerative clustering for gene trees.
  4. Training an SVM to detect credit card fraud.
* **Back:**
  1. Linear Regression $\to$ **Supervised (S)** (requires target values $y$).
  2. K-Means $\to$ **Unsupervised (U)** (operates on unlabeled inputs $x$).
  3. Hierarchical Agglomerative Clustering $\to$ **Unsupervised (U)** (groups unlabeled data points).
  4. Support Vector Machine $\to$ **Supervised (S)** (requires ground-truth fraud labels $y \in \{-1, +1\}$).

---

### CARD 066
* **Topic:** Midterm Practice Q2
* **Category:** Optimization
* **Difficulty:** Medium
* **Front:** Explain the fundamental difference between Batch Gradient Descent and Stochastic Gradient Descent (SGD).
* **Back:**
  * **Batch Gradient Descent:** Computes error gradients across the **entire training dataset ($N$ points)** before performing a single parameter update. Gradients are exact and deterministic, but computationally expensive per step.
  * **Stochastic Gradient Descent (SGD):** Evaluates error and performs a parameter update after **each individual training instance ($N=1$)**. Highly computationally lightweight per step and noisy, helping escape local minima, but oscillates around the optimum rather than converging smoothly.

---

### CARD 067
* **Topic:** Midterm Practice Q3
* **Category:** Parametric vs. Non-Parametric
* **Difficulty:** Medium
* **Front:** State whether Decision Trees and Logistic Regression are parametric or non-parametric, with justification.
* **Back:**
  * **Logistic Regression $\to$ Parametric:** Has a fixed, finite parameter vector $\theta \in \mathbb{R}^{d+1}$ predetermined strictly by the number of input features $d$, independent of training sample size $N$.
  * **Decision Trees $\to$ Non-Parametric:** Does not assume a fixed parameter count or mathematical function. The tree structure, depth, and number of split thresholds grow dynamically with the complexity and size of training data $N$.

---

### CARD 068
* **Topic:** Midterm Practice Q4
* **Category:** Regularization
* **Difficulty:** Medium
* **Front:** Explain the difference between L1 (Lasso) and L2 (Ridge) Regularization in terms of weight behavior.
* **Back:**
  * **L1 (Lasso):** Minimizes sum of absolute values $\lambda \sum |\theta_i|$. Its sharp constraint corners drive less important coefficients **strictly to zero**, performing automatic feature selection and producing sparse models.
  * **L2 (Ridge):** Minimizes sum of squared magnitudes $\lambda \sum \theta_i^2$. Shrinks weights smoothly toward zero without forcing them exactly to zero, keeping all features active while curbing extreme values.

---

### CARD 069
* **Topic:** Midterm Practice Q5
* **Category:** Dimensionality Reduction
* **Difficulty:** Easy
* **Front:** List two distinct reasons why dimensionality reduction (e.g., PCA) is useful in ML.
* **Back:**
  1. **Mitigates the Curse of Dimensionality:** Reduces extreme feature sparsity and computational memory/training cost while making distance metrics meaningful.
  2. **Eliminates Multicollinearity & Noise:** Compresses correlated features into orthogonal variance axes, filtering random noise and enabling 2D/3D visualization.

---

### CARD 070
* **Topic:** Midterm Practice Q6
* **Category:** Feature Selection
* **Difficulty:** Medium
* **Front:** Contrast Forward Feature Selection and Backward Feature Elimination.
* **Back:**
  * **Forward Selection:** Greedy bottom-up wrapper method. Starts with an empty feature set ($\emptyset$); iteratively tests each feature, adding the single feature that yields the greatest performance increase until no significant gain is observed.
  * **Backward Elimination:** Greedy top-down wrapper method. Starts with the complete set of all $d$ features; iteratively removes the single feature whose removal degrades performance the least, repeating until further removal hurts performance.

---

### CARD 071
* **Topic:** Midterm Practice Q7
* **Category:** SVM Kernel
* **Difficulty:** Medium
* **Front:** What is the role of the Kernel function in SVM, and why is it useful for non-linear data?
* **Back:**
  The kernel function computes the dot product of data points in a transformed, higher-dimensional feature space ($K(x, z) = \langle\phi(x), \phi(z)\rangle$) without explicitly calculating or storing the higher-dimensional vectors. This allows linear SVM hyperplanes to separate complex, non-linearly separable data patterns efficiently.

---

### CARD 072
* **Topic:** Midterm Practice Q8
* **Category:** Decision Trees
* **Difficulty:** Easy
* **Front:** Name one specific method used to avoid overfitting in a Decision Tree and explain how it works.
* **Back:**
  * **Max Depth Pruning:** Enforces a hard ceiling on the maximum tree depth from the root. Once a branch reaches this depth, splitting halts immediately and a leaf node is assigned the majority class label, preventing the tree from isolating individual training samples into single-sample leaves.
  * *(Alternative valid answers: `min_samples_split`, `min_samples_leaf`, cost-complexity post-pruning).*

---

### CARD 073
* **Topic:** Midterm Practice Q9
* **Category:** Pipeline Partitions
* **Difficulty:** Easy
* **Front:** Into which three subsets is a dataset partitioned for ML development? Briefly state the purpose of each.
* **Back:**
  1. **Training Set:** Used to optimize and learn internal model parameters (e.g., weights $\theta$).
  2. **Validation Set:** Used to evaluate models during development, tune hyperparameters ($k, C, \text{depth}$), and trigger early stopping.
  3. **Test Set:** Held-out completely until development ends to provide an unbiased final estimate of model performance on unseen data.

---

### CARD 074
* **Topic:** Midterm Practice Q10
* **Category:** Class Imbalance
* **Difficulty:** Medium
* **Front:** Define Undersampling and Oversampling for imbalanced data, and identify a key drawback of each.
* **Back:**
  * **Undersampling:** Decreases majority class size by discarding majority instances.
    * *Drawback:* **Loss of potentially critical information** and statistical diversity from discarded data.
  * **Oversampling:** Increases minority class size by duplicating minority points or synthesizing new points (e.g., SMOTE).
    * *Drawback:* **Risk of overfitting** (with random duplication) or introducing **unrealistic synthetic artifacts** that distort decision boundaries (with interpolation).

---

### CARD 075
* **Topic:** Midterm Practice Q11
* **Category:** Ensemble Choice
* **Difficulty:** Hard
* **Front:** If a base learner exhibits high bias (underfitting), should you use Bagging or Boosting? Justify using their improvement mechanisms.
* **Back:**
  * **Choice:** **Boosting**.
  * **Justification:**
    * **Bagging** reduces *variance* by averaging predictions across parallel independent models; it cannot reduce bias. If base learners are high-bias, Bagging simply outputs an ensemble with the same high bias.
    * **Boosting** is explicitly designed to reduce *bias*. It trains weak learners sequentially, forcing each subsequent model to fit the residuals/errors of earlier models, building an expressive complex decision surface from simple weak learners.

---

### CARD 076
* **Topic:** Midterm Practice Q12 (Numerical)
* **Category:** k-NN Calculation
* **Difficulty:** Medium
* **Front:**
  Given training points:
  * $x_1 = (0, 0)$, Label A
  * $x_2 = (2, 0)$, Label A
  * $x_3 = (2, 3)$, Label B
  * $x_4 = (3, 1)$, Label B
  * $x_5 = (4, 1)$, Label B

  Classify query point $x^* = (2, 1)$ using Euclidean distance for:
  **(a)** $k = 1$
  **(b)** $k = 3$
* **Back:**
  * **Step 1: Compute Euclidean distance $d(x^*, x_i) = \sqrt{(2 - x_{i,1})^2 + (1 - x_{i,2})^2}$:**
    * $d(x^*, x_1) = \sqrt{(2-0)^2 + (1-0)^2} = \sqrt{4 + 1} = \sqrt{5} \approx 2.236$
    * $d(x^*, x_2) = \sqrt{(2-2)^2 + (1-0)^2} = \sqrt{0 + 1} = \sqrt{1} = \mathbf{1.0}$
    * $d(x^*, x_3) = \sqrt{(2-2)^2 + (1-3)^2} = \sqrt{0 + 4} = \sqrt{4} = \mathbf{2.0}$
    * $d(x^*, x_4) = \sqrt{(2-3)^2 + (1-1)^2} = \sqrt{1 + 0} = \sqrt{1} = \mathbf{1.0}$
    * $d(x^*, x_5) = \sqrt{(2-4)^2 + (1-1)^2} = \sqrt{4 + 0} = \sqrt{4} = \mathbf{2.0}$
  * **Step 2: Ranked neighbors:**
    1. $x_2$ (dist = 1.0, Label A) & $x_4$ (dist = 1.0, Label B) [Tie for 1st/2nd]
    3. $x_3$ (dist = 2.0, Label B) & $x_5$ (dist = 2.0, Label B) [Tie for 3rd/4th]
    5. $x_1$ (dist = 2.236, Label A)
  * **(a) For $k = 1$:** Tie between $x_2$ (A) and $x_4$ (B). Resolved by tie-breaking rule (or labeled **Tie between A and B**).
  * **(b) For $k = 3$:** Neighbors include $x_2$ (A), $x_4$ (B), and either $x_3$ (B) or $x_5$ (B). In either selection, votes are **1 vote A, 2 votes B**.
    * **Final Label ($k=3$): B** (majority vote).

---

### CARD 077
* **Topic:** Midterm Practice Q13 (Numerical)
* **Category:** Data Imputation
* **Difficulty:** Medium
* **Front:**
  Given training dataset:
  * ID 1: Age 20, Label A
  * ID 2: Age 22, Label A
  * ID 3: Age ?, Label A
  * ID 4: Age 30, Label B
  * ID 5: Age 28, Label B
  * ID 6: Age 32, Label B

  **(a)** Compute replacement for ID 3 using Global Mean Imputation.  
  **(b)** Compute replacement for ID 3 using Class-Conditional Mean Imputation.  
  **(c)** If ID 3 were in the test set, which method must be used and why?
* **Back:**
  * **(a) Global Mean:** Average all known ages across entire dataset:
    $$\text{Mean} = \frac{20 + 22 + 30 + 28 + 32}{5} = \frac{132}{5} = \mathbf{26.4}$$
  * **(b) Class-Conditional Mean:** Average known ages in Class A only:
    $$\text{Mean}_A = \frac{20 + 22}{2} = \frac{42}{2} = \mathbf{21.0}$$
  * **(c) Test Set Imputation Rule:**
    Must use **Global Mean Imputation**. During test inference, true class labels $Y$ are unknown and cannot be used to condition feature values. Attempting class-conditional imputation on test data represents label leakage / unfeasible test assumptions.

---

### CARD 078
* **Topic:** Midterm Practice Q14 (Numerical)
* **Category:** Decision Tree Split Optimization
* **Difficulty:** Hard
* **Front:**
  Given dataset:
  * ID 1: $X = 2$, Status = Normal
  * ID 2: $X = 4$, Status = Normal
  * ID 3: $X = 6$, Status = Faulty
  * ID 4: $X = 8$, Status = Faulty
  * ID 5: $X = 10$, Status = Faulty

  **(a)** Compute initial Parent Entropy $H(Y)$.  
  **(b)** Compute Information Gain for candidate split thresholds $t_1 = 5$ and $t_2 = 7$.  
  **(c)** Which threshold should be chosen by CART?
* **Back:**
  * **(a) Parent Entropy $H(Y)$:**
    * Total $N = 5$: 2 Normal ($p = 2/5 = 0.4$), 3 Faulty ($p = 3/5 = 0.6$).
    $$H(Y) = - [0.4 \log_2(0.4) + 0.6 \log_2(0.6)] = - [0.4(-1.3219) + 0.6(-0.7370)] = 0.5288 + 0.4422 = \mathbf{0.9710} \text{ bits}$$
  * **(b) Split Evaluated at $t_1 = 5$ ($X \le 5$ vs $X > 5$):**
    * *Left Node ($X \le 5$):* IDs 1, 2 (2 Normal, 0 Faulty) $\to p=1.0 \to H_{\text{Left}} = \mathbf{0.0}$.
    * *Right Node ($X > 5$):* IDs 3, 4, 5 (0 Normal, 3 Faulty) $\to p=1.0 \to H_{\text{Right}} = \mathbf{0.0}$.
    * Weighted Entropy: $H_{\text{split}}(t_1) = \frac{2}{5}(0.0) + \frac{3}{5}(0.0) = \mathbf{0.0}$.
    * **Information Gain:** $IG(t_1) = 0.9710 - 0.0 = \mathbf{0.9710} \text{ bits}$.
  * **Split Evaluated at $t_2 = 7$ ($X \le 7$ vs $X > 7$):**
    * *Left Node ($X \le 7$):* IDs 1, 2, 3 (2 Normal, 1 Faulty) $\to p_N = 2/3, p_F = 1/3$:
      $$H_{\text{Left}} = -\left[\frac{2}{3}\log_2\left(\frac{2}{3}\right) + \frac{1}{3}\log_2\left(\frac{1}{3}\right)\right] \approx \mathbf{0.9183} \text{ bits}$$
    * *Right Node ($X > 7$):* IDs 4, 5 (0 Normal, 2 Faulty) $\to H_{\text{Right}} = \mathbf{0.0}$.
    * Weighted Entropy: $H_{\text{split}}(t_2) = \frac{3}{5}(0.9183) + \frac{2}{5}(0.0) = \mathbf{0.5510} \text{ bits}$.
    * **Information Gain:** $IG(t_2) = 0.9710 - 0.5510 = \mathbf{0.4200} \text{ bits}$.
  * **(c) Chosen Threshold:**
    Choose **$t_1 = 5$** because it achieves maximum information gain ($0.9710 > 0.4200$), perfectly separating the dataset into pure homogeneous subsets.

---

### CARD 079
* **Topic:** Multi-Class Evaluation Metrics
* **Category:** Numerical Calculation
* **Difficulty:** Hard
* **Front:**
  Given a 3-class confusion matrix:
  * Class 1 (Chihuahua): 100 TP, 31 FP, 25 FN
  * Class 2 (Jack Russell): 200 TP, 20 FP, 30 FN
  * Class 3 (Newfoundland): 50 TP, 5 FP, 1 FN

  Compute the **Macro-Average Recall** and **Weighted-Average Recall**.
* **Back:**
  * **Step 1: Compute Per-Class Recall $\text{Recall}_k = \frac{\text{TP}_k}{\text{TP}_k + \text{FN}_k}$:**
    * $\text{Recall}_1 = \frac{100}{100 + 25} = \frac{100}{125} = \mathbf{0.800}$
    * $\text{Recall}_2 = \frac{200}{200 + 30} = \frac{200}{230} \approx \mathbf{0.8696}$
    * $\text{Recall}_3 = \frac{50}{50 + 1} = \frac{50}{51} \approx \mathbf{0.9804}$
  * **Step 2: Macro-Average Recall (unweighted mean):**
    $$\text{Recall}_{\text{macro}} = \frac{0.800 + 0.8696 + 0.9804}{3} = \frac{2.650}{3} \approx \mathbf{0.8833} \text{ (or } 88.3\%)$$
  * **Step 3: Weighted-Average Recall (weighted by support $N_1=125, N_2=230, N_3=51$, Total $N=406$):**
    $$\text{Recall}_{\text{weighted}} = \frac{125(0.800) + 230(0.8696) + 51(0.9804)}{406} = \frac{100 + 200 + 50}{406} = \frac{350}{406} \approx \mathbf{0.8621} \text{ (or } 86.2\%)$$

---

### CARD 080
* **Topic:** Decision Stump Mechanics
* **Category:** Boosting Weak Learners
* **Difficulty:** Medium
* **Front:** What is a "Decision Stump"? In which ensemble architecture is it predominantly used as the base learner?
* **Back:**
  * **Definition:** A 1-level decision tree consisting of a single root decision split and two terminal leaf nodes. It classifies instances based on a single threshold on a single feature.
  * **Characteristics:** Extremely high bias, very low variance, computationally trivial to fit.
  * **Usage:** Predominantly used as the quintessential **weak learner** in **AdaBoost**, where sequential re-weighting enables hundreds of weak decision stumps to form a complex, highly accurate ensemble boundary.