"""
Model Training Script (Stacking Ensemble)
- Binary Classification: Predicts the probability of a song going viral (is_viral = 1 if popularity > 70)
- Combines Random Forest, XGBoost, and optionally LightGBM and CatBoost classifiers using a Logistic Regression meta-model.
"""

import pandas as pd
import numpy as np
import argparse
import os
import joblib
import warnings
warnings.filterwarnings('ignore')

# sklearn model selection & preprocessing
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, StackingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from imblearn.over_sampling import SMOTE
import xgboost as xgb

# Optional: LightGBM
try:
    import lightgbm as lgb
    LGBM_AVAILABLE = True
except ImportError:
    LGBM_AVAILABLE = False

# Optional: CatBoost
try:
    from catboost import CatBoostClassifier
    CATBOOST_AVAILABLE = True
except ImportError:
    CATBOOST_AVAILABLE = False


# =====================================================
#  Stacking Classifier Trainer
# =====================================================
class EnsembleClassifierTrainer:

    def __init__(self, random_state=42):
        self.random_state = random_state
        self.model = None
        self.scaler = None

    def prepare_data(self, df, feature_cols, target_col='is_viral'):
        """Prepare data for classification. Target is is_viral (0 or 1)."""
        X = df[feature_cols].fillna(df[feature_cols].median())
        y = df[target_col].copy()

        # Check class distribution
        class_counts = y.value_counts()
        minority_count = class_counts.min()
        print(f"\nClass distribution:\n{class_counts.to_string()}")
        print(f"Minority class has {minority_count} samples")

        # Use stratified split if the minority class has at least 2 members,
        # otherwise fall back to non-stratified split
        if minority_count >= 2:
            try:
                X_train, X_test, y_train, y_test = train_test_split(
                    X, y, test_size=0.2, random_state=self.random_state, stratify=y
                )
            except ValueError as e:
                print(f"Stratified split failed ({e}), falling back to non-stratified split.")
                X_train, X_test, y_train, y_test = train_test_split(
                    X, y, test_size=0.2, random_state=self.random_state
                )
        else:
            print("Warning: Minority class too small for stratification, using non-stratified split.")
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=self.random_state
            )

        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        self.scaler = scaler

        # Store minority count for cross-validation configuration
        self._minority_count = y_train.value_counts().min()

        # Handle class imbalance using SMOTE
        minority_size = y_train.value_counts().min()
        if minority_size > 5:
            try:
                smote = SMOTE(random_state=self.random_state)
                X_train_scaled, y_train = smote.fit_resample(X_train_scaled, y_train)
                print(f"Applied SMOTE: Balanced dataset to {len(X_train_scaled)} training samples")
            except Exception as e:
                print(f"SMOTE application failed, training without SMOTE: {e}")

        return X_train_scaled, X_test_scaled, y_train, y_test, scaler

    def train(self, X_train, y_train):
        """Train Stacking Classifier ensemble."""
        # 1. Base Classifiers
        # Logistic Regression
        lr = LogisticRegression(max_iter=1000, random_state=self.random_state)
        # Random Forest
        rf = RandomForestClassifier(n_estimators=100, random_state=self.random_state, n_jobs=-1)
        # XGBoost
        xg = xgb.XGBClassifier(n_estimators=100, learning_rate=0.1, random_state=self.random_state, n_jobs=-1, eval_metric='logloss')

        base_models = [('rf', rf), ('xgb', xg)]

        # LightGBM (if available)
        if LGBM_AVAILABLE:
            try:
                lg = lgb.LGBMClassifier(n_estimators=100, random_state=self.random_state, verbose=-1, n_jobs=-1)
                base_models.append(('lgbm', lg))
                print("LightGBM Classifier added to ensemble base models.")
            except Exception as e:
                print(f"Failed to load LightGBM Classifier: {e}")

        # CatBoost (if available)
        if CATBOOST_AVAILABLE:
            try:
                cb = CatBoostClassifier(iterations=100, random_state=self.random_state, verbose=0)
                base_models.append(('catboost', cb))
                print("CatBoost Classifier added to ensemble base models.")
            except Exception as e:
                print(f"Failed to load CatBoost Classifier: {e}")

        # Stacking Classifier
        # Reduce CV folds if minority class is small to avoid cross-validation errors
        cv_folds = min(5, getattr(self, '_minority_count', 5))
        cv_folds = max(cv_folds, 2)  # at least 2-fold
        print(f"Training Stacking Ensemble Classifier (cv={cv_folds})...")
        self.model = StackingClassifier(
            estimators=base_models,
            final_estimator=LogisticRegression(max_iter=1000, random_state=self.random_state),
            cv=cv_folds,
            n_jobs=-1
        )
        self.model.fit(X_train, y_train)
        print("Stacking Ensemble Classifier trained successfully.")
        return self

    def evaluate(self, X_test, y_test):
        """Evaluate classification metrics."""
        y_pred = self.model.predict(X_test)
        y_prob = self.model.predict_proba(X_test)[:, 1]

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        auc = roc_auc_score(y_test, y_prob)

        print("\n" + "="*50)
        print("Stacking Ensemble Classifier Performance")
        print("="*50)
        print(f"Accuracy:  {acc:.4f}")
        print(f"Precision: {prec:.4f}")
        print(f"Recall:    {rec:.4f}")
        print(f"F1 Score:  {f1:.4f}")
        print(f"ROC AUC:   {auc:.4f}")
        print("\nSample predictions vs actual:")
        for i in range(min(5, len(y_test))):
            print(f"  Actual: {y_test.iloc[i]}  Predicted Probability: {y_prob[i]:.4f} (Predicted Class: {y_pred[i]})")


# =====================================================
# MAIN
# =====================================================
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', type=str, required=True)
    parser.add_argument('--output', type=str, default='models',
                        help='Directory to save trained models')
    parser.add_argument('--no-optuna', action='store_true', help='Ignored for compatibility')
    parser.add_argument('--no-mlflow', action='store_true', help='Ignored for compatibility')
    parser.add_argument('--no-shap', action='store_true', help='Ignored for compatibility')
    parser.add_argument('--quick', action='store_true', help='Skip hyperparameter search (faster)')
    args = parser.parse_args()

    df = pd.read_csv(args.input)

    # Automatically construct is_viral target if it doesn't exist yet
    if 'is_viral' not in df.columns:
        df['is_viral'] = (df['popularity'] > 70).astype(int)

    exclude_cols = ['track_id', 'track_name', 'artist_name', 'is_viral', 'popularity']
    # Exclude popularity-derived features (target leakage)
    exclude_cols.extend([c for c in df.columns if 'popularity_bucket' in c])
    categorical_raw = ['mood', 'duration_category', 'tempo_category', 'release_season']
    exclude_cols.extend([c for c in categorical_raw if c in df.columns])
    
    feature_cols = [c for c in df.columns if c not in exclude_cols
                    and df[c].dtype in ['float64', 'int64', 'float32', 'int32']]

    trainer = EnsembleClassifierTrainer()
    X_train, X_test, y_train, y_test, scaler = trainer.prepare_data(
        df, feature_cols, target_col='is_viral'
    )
    trainer.train(X_train, y_train)
    trainer.evaluate(X_test, y_test)

    # Save for production
    os.makedirs(args.output, exist_ok=True)
    joblib.dump(scaler, os.path.join(args.output, 'scaler.joblib'))
    with open(os.path.join(args.output, 'feature_columns.json'), 'w') as f:
        import json
        json.dump(feature_cols, f, indent=2)
    joblib.dump(trainer.model, os.path.join(args.output, 'best_model.joblib'))
    
    print(f"\nModels saved to {args.output}/")
    print("Training Completed Successfully!")


if __name__ == "__main__":
    main()
