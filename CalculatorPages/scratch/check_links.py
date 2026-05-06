import os

# Updated list based on the fixes applied
links = [
    "about.html",
    "academic.html",
    "ai-costs.html",
    "apple-touch-icon.png",
    "audio.html",
    "auto.html",
    "blog/bmi-limitations-what-it-misses.html",
    "blog/how-to-read-your-burn-rate.html",
    "blog/customer-churn-the-growth-killer.html",
    "blog/cockcroft-gault-equation-for-clinicians.html",
    "blog/ev-vs-gas-true-cost-breakdown.html",
    "blog/home-renovation-roi.html",
    "blog/how-compounding-frequency-affects-returns.html",
    "blog/how-to-calculate-your-fire-number.html",
    "blog/index.html",
    "blog/llc-vs-scorp-which-saves-more-tax.html",
    "blog/science-of-body-fat-percentage.html",
    "blog/mortgage-amortization-explained.html",
    "blog/one-percent-rule-of-real-estate.html",
    "blog/roas-vs-roi-marketing-metrics.html",
    "blog/schengen-90-180-rule-explained.html",
    "blog/the-1000-dollar-hour.html",
    "blog/the-hidden-cost-of-burnout.html",
    "blog/understanding-llm-api-costs.html",
    "blog/what-is-tdee-and-why-it-matters.html",
    "business.html",
    "career.html",
    "contact.html",
    "culinary.html",
    "disclaimer.html",
    "diy.html",
    "engineering.html",
    "favicon.svg",
    "finance.html",
    "fitness.html",
    "gaming.html",
    "global.css",
    "green.html",
    "health.html",
    "index.html",
    "invest.html",
    "legal-tax.html",
    "legal.html",
    "life.html",
    "logistics.html",
    "manifest.json",
    "marketing.html",
    "math.html",
    "medical.html",
    "parenting.html",
    "pets.html",
    "privacy.html",
    "productivity.html",
    "psych.html",
    "real-estate.html",
    "savings.html",
    "science.html",
    "spiritual.html",
    "survival.html",
    "terms.html",
    "travel.html",
    "unit-converters.html"
]

broken = []
for link in links:
    if not os.path.exists(link):
        broken.append(link)

if broken:
    print("Broken links found:")
    for b in broken:
        print(f" - {b}")
else:
    print("No broken links found!")
