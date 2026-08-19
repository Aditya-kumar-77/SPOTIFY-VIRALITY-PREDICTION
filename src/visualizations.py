"""
Visualization Script (Lab Version)

Creates visualizations for:
- EDA
- Feature importance
- Confusion matrices
- ROC curves
- Model comparison
"""

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, roc_curve, auc
import argparse
import os

plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")


class VisualizationGenerator:

    def __init__(self, output_dir='visualizations'):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    # --------------------------------------------------
    # Feature Distributions
    # --------------------------------------------------
    def plot_feature_distributions(self, df, features):

        fig, axes = plt.subplots(3, 3, figsize=(15, 12))
        axes = axes.ravel()

        for idx, feature in enumerate(features[:9]):
            if feature in df.columns:
                axes[idx].hist(df[feature], bins=50,
                               edgecolor='black', alpha=0.7)
                axes[idx].set_title(f'Distribution of {feature}')
                axes[idx].set_xlabel(feature)
                axes[idx].set_ylabel('Frequency')

        plt.tight_layout()
        plt.savefig(os.path.join(self.output_dir,
                                 'feature_distributions.png'),
                    dpi=300)
        plt.close()
        print("Saved: feature_distributions.png")

    # --------------------------------------------------
    # Correlation Matrix
    # --------------------------------------------------
    def plot_correlation_matrix(self, df, features):

        numeric_features = [
            f for f in features
            if f in df.columns and df[f].dtype in ['float64', 'int64']
        ]

        corr_matrix = df[numeric_features].corr()

        plt.figure(figsize=(12, 10))
        sns.heatmap(corr_matrix,
                    cmap='coolwarm',
                    center=0,
                    square=True)
        plt.title('Feature Correlation Matrix')
        plt.tight_layout()

        plt.savefig(os.path.join(self.output_dir,
                                 'correlation_matrix.png'),
                    dpi=300)
        plt.close()
        print("Saved: correlation_matrix.png")

    # --------------------------------------------------
    # Viral vs Non-Viral
    # --------------------------------------------------
    def plot_viral_vs_nonviral(self, df):

        audio_features = [
            'danceability', 'energy', 'valence',
            'loudness', 'speechiness', 'acousticness'
        ]

        fig, axes = plt.subplots(2, 3, figsize=(15, 10))
        axes = axes.ravel()

        for idx, feature in enumerate(audio_features):
            if feature in df.columns:
                viral = df[df['is_viral'] == 1][feature]
                non_viral = df[df['is_viral'] == 0][feature]

                axes[idx].hist(non_viral, bins=30,
                               alpha=0.5, label='Non-Viral')
                axes[idx].hist(viral, bins=30,
                               alpha=0.5, label='Viral')
                axes[idx].set_title(feature)
                axes[idx].legend()

        plt.tight_layout()
        plt.savefig(os.path.join(self.output_dir,
                                 'viral_vs_nonviral.png'),
                    dpi=300)
        plt.close()
        print("Saved: viral_vs_nonviral.png")

    # --------------------------------------------------
    # Feature Importance
    # --------------------------------------------------
    def plot_feature_importance(self, model,
                                feature_names,
                                model_name):

        if hasattr(model, 'feature_importances_'):

            importances = model.feature_importances_
            indices = np.argsort(importances)[::-1][:20]

            plt.figure(figsize=(10, 8))
            plt.barh(range(len(indices)),
                     importances[indices])
            plt.yticks(range(len(indices)),
                       [feature_names[i] for i in indices])
            plt.gca().invert_yaxis()
            plt.title(f'Top Features - {model_name}')
            plt.tight_layout()

            filename = f'feature_importance_{model_name}.png'
            plt.savefig(os.path.join(self.output_dir,
                                     filename),
                        dpi=300)
            plt.close()
            print(f"Saved: {filename}")

        elif hasattr(model, 'coef_'):

            coef = np.abs(model.coef_[0])
            indices = np.argsort(coef)[::-1][:20]

            plt.figure(figsize=(10, 8))
            plt.barh(range(len(indices)),
                     coef[indices])
            plt.yticks(range(len(indices)),
                       [feature_names[i] for i in indices])
            plt.gca().invert_yaxis()
            plt.title(f'Top Coefficients - {model_name}')
            plt.tight_layout()

            filename = f'feature_importance_{model_name}.png'
            plt.savefig(os.path.join(self.output_dir,
                                     filename),
                        dpi=300)
            plt.close()
            print(f"Saved: {filename}")

    # --------------------------------------------------
    # Confusion Matrices
    # --------------------------------------------------
    def plot_confusion_matrices(self, results, y_test):

        n_models = len(results)
        fig, axes = plt.subplots(1, n_models,
                                 figsize=(5*n_models, 5))

        if n_models == 1:
            axes = [axes]

        for ax, (model_name, result) in zip(axes,
                                            results.items()):

            cm = confusion_matrix(y_test,
                                  result['y_pred'])

            sns.heatmap(cm,
                        annot=True,
                        fmt='d',
                        cmap='Blues',
                        ax=ax)

            ax.set_title(model_name)
            ax.set_xlabel('Predicted')
            ax.set_ylabel('Actual')

        plt.tight_layout()
        plt.savefig(os.path.join(self.output_dir,
                                 'confusion_matrices.png'),
                    dpi=300)
        plt.close()
        print("Saved: confusion_matrices.png")

    # --------------------------------------------------
    # ROC Curves
    # --------------------------------------------------
    def plot_roc_curves(self, results, y_test):

        plt.figure(figsize=(8, 6))

        for model_name, result in results.items():

            fpr, tpr, _ = roc_curve(y_test,
                                    result['y_pred_proba'])
            roc_auc = auc(fpr, tpr)

            plt.plot(fpr, tpr,
                     label=f'{model_name} (AUC={roc_auc:.3f})')

        plt.plot([0, 1], [0, 1], 'k--')
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title('ROC Curve Comparison')
        plt.legend()

        plt.tight_layout()
        plt.savefig(os.path.join(self.output_dir,
                                 'roc_curves.png'),
                    dpi=300)
        plt.close()
        print("Saved: roc_curves.png")

    # --------------------------------------------------
    # Model Comparison
    # --------------------------------------------------
    def plot_model_comparison(self, results_df):

        metrics = ['accuracy', 'precision',
                   'recall', 'f1_score', 'roc_auc']

        available = [m for m in metrics
                     if m in results_df.columns]

        if not available:
            return

        results_df[available].plot(kind='bar',
                                   figsize=(10, 6))
        plt.title('Model Performance Comparison')
        plt.ylabel('Score')
        plt.ylim(0, 1)
        plt.xticks(rotation=45)
        plt.tight_layout()

        plt.savefig(os.path.join(self.output_dir,
                                 'model_comparison.png'),
                    dpi=300)
        plt.close()
        print("Saved: model_comparison.png")


# =====================================================
# MAIN
# =====================================================
def main():

    parser = argparse.ArgumentParser()
    parser.add_argument('--data', type=str, required=True)
    parser.add_argument('--results', type=str)
    parser.add_argument('--output', type=str,
                        default='visualizations/')
    args = parser.parse_args()

    df = pd.read_csv(args.data)

    viz = VisualizationGenerator(args.output)

    # ----- EDA -----
    audio_features = [
        'danceability', 'energy', 'valence',
        'loudness', 'speechiness',
        'acousticness', 'tempo', 'duration_min'
    ]

    viz.plot_feature_distributions(df, audio_features)
    viz.plot_correlation_matrix(df, audio_features)

    if 'is_viral' in df.columns:
        viz.plot_viral_vs_nonviral(df)

    # ----- Model comparison -----
    if args.results and os.path.exists(args.results):
        results_df = pd.read_csv(args.results,
                                 index_col=0)
        viz.plot_model_comparison(results_df)

    print("\nVisualization generation completed!")


if __name__ == '__main__':
    main()
