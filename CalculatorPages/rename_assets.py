import os

target_dir = "blog/assets/"

mapping = {
    "biological_age_longevity_1777594341741.png": "longevity.png",
    "body_fat_composition_1777594081110.png": "body-fat.png",
    "compound_interest_growth_1777594069210.png": "compound-interest.png",
    "crypto_vs_stocks_roi_1777594314333.png": "crypto-vs-stocks.png",
    "fire_movement_retirement_1777594264232.png": "fire-movement.png",
    "hydration_science_water_1777594708893.png": "hydration.png",
    "interior_design_math_1777594091357.png": "interior-design.png",
    "macro_nutrients_fueling_1777594693397.png": "macro-nutrients.png",
    "mortgage_strategy_high_rate_1777594249578.png": "mortgage-strategy.png",
    "pareto_principle_time_1777594353647.png": "productivity.png",
    "physics_in_the_kitchen_1777594287883.png": "kitchen-physics.png",
    "pregnancy_math_timeline_1777594273932.png": "pregnancy.png",
    "side_hustle_profitability_1777594328832.png": "side-hustle.png",
    "statistics_misleading_data_1777594719991.png": "statistics.png",
    "travel_math_lifestyle_1777594104174.png": "travel-math.png"
}

for src, dst in mapping.items():
    src_path = os.path.join(target_dir, src)
    dst_path = os.path.join(target_dir, dst)
    if os.path.exists(src_path):
        try:
            # If the destination already exists (e.g. as a 0-byte file), remove it first
            if os.path.exists(dst_path):
                os.remove(dst_path)
            os.rename(src_path, dst_path)
            print(f"Renamed {src} to {dst}")
        except Exception as e:
            print(f"Failed to rename {src}: {e}")
    else:
        print(f"Source file {src} not found in {target_dir}")
