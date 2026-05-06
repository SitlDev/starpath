"""
Sample data seeding script for StarPath backend.
Run with: python seed_data.py
"""

from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.facility import Facility
from app.models.health_inspection import HealthInspection, SurveyType
from app.models.star_rating import StarRating
from app.models.deficiency import Deficiency
from app.models.user import User
from app.utils.security import get_password_hash
from app.database import Base

# Sample data
FACILITY_NAMES = [
    "Sunny Valley Skilled Nursing",
    "Meadowbrook Care Center",
    "Hope Springs Senior Living",
    "Sunrise Rehabilitation Hospital",
    "Peaceful Pines Nursing Facility",
    "Golden Years Care Home",
    "Riverside Health & Wellness",
    "Heritage Senior Care",
    "Comfort Care Facility",
    "New Horizon Nursing Center",
]

DEFICIENCY_DESCRIPTIONS = [
    "Staff did not follow proper infection control procedures",
    "Resident pain management protocols not documented",
    "Medication administration errors observed",
    "Environmental safety concerns in patient rooms",
    "Inadequate nutrition and hydration monitoring",
    "Communication gaps in care team",
    "Falls prevention measures insufficient",
    "Skin care and wound management deficient",
    "Activity and social engagement programs limited",
    "Physician orders not implemented in timely manner",
]

# Sample F-tags (federal tags) for deficiencies
F_TAGS = [
    "F600", "F601", "F602", "F603", "F604", "F605", "F606", "F607", "F608", "F609",
    "F700", "F701", "F702", "F703", "F704", "F705", "F706", "F707", "F708", "F709",
]


def seed_database():
    """Seed the database with sample data."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Clear existing data
        db.query(StarRating).delete()
        db.query(Deficiency).delete()
        db.query(HealthInspection).delete()
        db.query(Facility).delete()
        db.query(User).delete()
        db.commit()

        print("Creating sample user...")
        # Create a sample user
        user = User(
            email="demo@starpath.com",
            full_name="Demo Administrator",
            hashed_password=get_password_hash("demo123456"),
            is_active=True,
            is_superuser=False,
        )
        db.add(user)
        db.commit()
        print(f"✓ Created user: demo@starpath.com (password: demo123456)")

        print("\nCreating sample facilities...")
        facilities = []
        for i, name in enumerate(FACILITY_NAMES, 1):
            facility = Facility(
                cms_provider_id=str(100000 + i),
                name=name,
                address={
                    "street": f"{random.randint(100, 9999)} {random.choice(['Main', 'Oak', 'Elm', 'Maple', 'Pine'])} Street",
                    "city": random.choice(["Springfield", "Shelbyville", "Capital City", "Riverside", "Westville"]),
                    "state": "IL",
                    "zip": f"{random.randint(60000, 60999)}",
                },
                ownership=random.choice(["For-Profit", "Non-Profit", "Government"]),
                bed_count=random.randint(80, 250),
                is_active=True,
            )
            db.add(facility)
            facilities.append(facility)

        db.commit()
        print(f"✓ Created {len(facilities)} facilities")

        print("\nCreating health inspections and ratings...")
        for facility in facilities:
            # Create 3 inspection cycles for each facility
            base_date = datetime.utcnow().date() - timedelta(days=365)

            for cycle in range(1, 4):
                # Survey date for this cycle
                survey_date = base_date + timedelta(days=cycle * 120)

                # Create health inspection
                inspection = HealthInspection(
                    facility_id=facility.id,
                    survey_date=survey_date,
                    survey_type=SurveyType.STANDARD if cycle <= 2 else SurveyType.REVISIT,
                    cycle=cycle,
                    revisit_count=random.randint(0, 2) if cycle == 3 else 0,
                )
                db.add(inspection)
                db.flush()

                # Create deficiencies for this inspection
                num_deficiencies = random.randint(0, 8)
                for _ in range(num_deficiencies):
                    deficiency = Deficiency(
                        health_inspection_id=inspection.id,
                        f_tag=random.choice(F_TAGS),
                        description=random.choice(DEFICIENCY_DESCRIPTIONS),
                        severity=random.choice(["1", "2", "3", "4"]),  # Severity codes
                        scope=random.choice(["D", "E", "F", "G", "H"]),  # Scope codes
                    )
                    db.add(deficiency)

                db.flush()

                # Create star rating for this inspection
                # Ratings tend to improve with recent cycles (lower deficiency count = higher rating)
                health_score = max(40, 100 - (num_deficiencies * 8) + random.randint(-5, 5))
                staffing_score = random.randint(65, 95)
                qm_score = random.randint(60, 90)

                def score_to_rating(score):
                    if score >= 90:
                        return 5
                    elif score >= 80:
                        return 4
                    elif score >= 70:
                        return 3
                    elif score >= 60:
                        return 2
                    else:
                        return 1

                overall_rating = max(
                    1,
                    min(
                        5,
                        int(
                            (
                                score_to_rating(health_score)
                                + score_to_rating(staffing_score)
                                + score_to_rating(qm_score)
                            )
                            / 3
                        ),
                    ),
                )

                rating = StarRating(
                    facility_id=facility.id,
                    effective_date=survey_date,
                    health_inspection_rating=score_to_rating(health_score),
                    staffing_rating=score_to_rating(staffing_score),
                    qm_rating=score_to_rating(qm_score),
                    overall_rating=overall_rating,
                    health_inspection_score=health_score,
                    staffing_score=staffing_score,
                    qm_score=qm_score,
                    calculation_details={
                        "deficiency_count": num_deficiencies,
                        "inspection_cycle": cycle,
                    },
                )
                db.add(rating)

            db.commit()
            print(f"✓ Created inspections and ratings for {facility.name}")

        print("\n" + "=" * 50)
        print("✅ Sample data seeding completed!")
        print("=" * 50)
        print("\nDemo Credentials:")
        print("  Email: demo@starpath.com")
        print("  Password: demo123456")
        print(f"\nCreated:")
        print(f"  • {len(facilities)} facilities with realistic data")
        print(f"  • 3 inspection cycles per facility")
        print(f"  • Health inspection deficiencies per cycle")
        print(f"  • Star ratings for each inspection")
        print("\nYou can now:")
        print("  1. Start the backend: python -m uvicorn app.main:app --reload")
        print("  2. Start the frontend: npm run dev")
        print("  3. Login with the demo credentials above")

    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
