import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

# Download the VADER lexicon (only once)
nltk.download('vader_lexicon')

# Initialize the analyzer
analyzer = SentimentIntensityAnalyzer()

def get_sentiment(text):
    scores = analyzer.polarity_scores(text)
    compound = scores['compound']

    # Determine mood
    if compound >= 0.05:
        mood = "positive"
    elif compound <= -0.05:
        mood = "negative"
    else:
        mood = "neutral"

    return {
        "mood": mood,
        "scores": scores
    }
