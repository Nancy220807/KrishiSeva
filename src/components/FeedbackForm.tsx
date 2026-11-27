import { useState, type FormEvent } from "react";
import { CheckCircle, MessageSquare, Star } from "lucide-react";
import { supabase } from "../lib/supabase";

export function FeedbackForm() {
  const [rating, setRating] = useState(0);
  const [wasHelpful, setWasHelpful] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rating === 0) {
      setError("Please select a rating before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess(false);

    const { error: submitError } = await supabase.from("feedback").insert({
      rating,
      was_helpful: wasHelpful,
      comment: comment.trim() || null,
    });

    setSubmitting(false);
    if (submitError) {
      setError("We couldn't submit your feedback. Please try again.");
      return;
    }

    setRating(0);
    setWasHelpful(null);
    setComment("");
    setSuccess(true);
  }

  return (
    <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-emerald-700" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900">Share Your Feedback</h2>
          <p className="text-sm text-gray-500">Help us make KrishiSeva better for farmers.</p>
        </div>
      </div>

      {success ? (
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-emerald-800" role="status">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">Thank you! Your feedback has been submitted.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <fieldset>
            <legend className="text-sm font-medium text-gray-800 mb-2">How would you rate your experience?</legend>
            <div className="flex items-center gap-2" aria-label="Select a rating from 1 to 5">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  aria-pressed={rating === value}
                  className="rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <Star className={`w-7 h-7 ${value <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                </button>
              ))}
              <span className="text-sm text-gray-500 ml-1">{rating ? `${rating}/5` : "Choose stars"}</span>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-gray-800 mb-2">Was KrishiSeva helpful?</legend>
            <div className="flex gap-3">
              {[{ label: "Yes", value: true }, { label: "No", value: false }].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setWasHelpful(option.value)}
                  aria-pressed={wasHelpful === option.value}
                  className={`px-5 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    wasHelpful === option.value
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 text-gray-600 hover:border-emerald-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="feedback-comment" className="block text-sm font-medium text-gray-800 mb-2">
              Suggestions or comments <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="feedback-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Tell us what worked well or what we can improve..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{comment.length}/1000</p>
          </div>

          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      )}
    </section>
  );
}
