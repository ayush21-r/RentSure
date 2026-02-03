"""
RentSure Rental Recommendation Engine

Ranks and recommends rental properties based on student profile preferences
using trust, safety, distance, and budget suitability scoring.
"""

from dataclasses import dataclass
from typing import List, Optional


@dataclass
class StudentProfile:
    """Student's rental preferences and constraints."""
    max_budget: int  # Maximum monthly rent in currency units
    preferred_distance_km: float  # Preferred distance from college/office


@dataclass
class RentalProperty:
    """Details of an available rental property."""
    property_id: str  # Unique identifier
    rent: int  # Monthly rent
    distance_km: float  # Distance from college/office
    safety_score: int  # Safety score (0-100)
    trust_score: int  # Owner trust score (0-100)
    description: str = ""  # Optional property description
    campus_fit_score: Optional[float] = None  # 0-10 campus proximity fit
    police_distance_km: Optional[float] = None  # Distance to nearest police station
    cctv_coverage: Optional[int] = None  # 0-100
    street_lighting: Optional[int] = None  # 0-100
    transit_access: Optional[int] = None  # 0-100
    price_fairness: Optional[str] = None  # "Fair", "Low", "High"
    response_time_minutes: Optional[int] = None
    complaints_count: Optional[int] = None
    image_url: Optional[str] = None  # Thumbnail image of the property
    is_direct_owner: bool = True  # Direct owner (no broker)
    availability_status: str = "available"  # "available", "limited", "occupied"
    payment_methods: Optional[List[str]] = None  # ["UPI", "Bank Transfer", "Cash"]
    gender_preference: Optional[str] = None  # "male", "female", "any"
    reviews: Optional[List[dict]] = None  # List of review dicts
    owner_id: Optional[str] = None
    owner_name: Optional[str] = None
    owner_average_rating: Optional[float] = None
    owner_response_time_minutes: Optional[int] = None
    owner_complaints_count: Optional[int] = None
    agreement_completed: Optional[bool] = None
    neighborhood: Optional[str] = None
    city_zone: Optional[str] = None
    nearby_college: Optional[str] = None
    college_distance_km: Optional[float] = None
    nearby_office_hub: Optional[str] = None
    office_distance_km: Optional[float] = None
    commute_minutes: Optional[int] = None
    women_safety_index: Optional[int] = None
    crime_index: Optional[int] = None
    night_transit_score: Optional[int] = None
    tiffin_options: Optional[List[dict]] = None


@dataclass
class RecommendationResult:
    """A ranked rental recommendation with scoring breakdown."""
    property_id: str
    overall_score: float
    rent: int
    distance_km: float
    safety_score: int
    trust_score: int
    campus_fit_score: Optional[float]
    police_distance_km: Optional[float]
    cctv_coverage: Optional[int]
    street_lighting: Optional[int]
    transit_access: Optional[int]
    price_fairness: Optional[str]
    response_time_minutes: Optional[int]
    complaints_count: Optional[int]
    budget_fit_score: float
    distance_fit_score: float
    safety_score_contrib: float
    trust_score_contrib: float
    description: str = ""
    image_url: Optional[str] = None  # Thumbnail image of the property
    is_direct_owner: bool = True
    availability_status: str = "available"
    payment_methods: Optional[List[str]] = None
    gender_preference: Optional[str] = None
    reviews: Optional[List[dict]] = None
    owner_id: Optional[str] = None
    owner_name: Optional[str] = None
    owner_average_rating: Optional[float] = None
    owner_response_time_minutes: Optional[int] = None
    owner_complaints_count: Optional[int] = None
    agreement_completed: Optional[bool] = None
    neighborhood: Optional[str] = None
    city_zone: Optional[str] = None
    nearby_college: Optional[str] = None
    college_distance_km: Optional[float] = None
    nearby_office_hub: Optional[str] = None
    office_distance_km: Optional[float] = None
    commute_minutes: Optional[int] = None
    women_safety_index: Optional[int] = None
    crime_index: Optional[int] = None
    night_transit_score: Optional[int] = None
    tiffin_options: Optional[List[dict]] = None


def calculate_rental_recommendation_score(
    rental: RentalProperty,
    student: StudentProfile
) -> RecommendationResult:
    """
    Calculate a composite recommendation score for a rental property.

    Scoring Components:
    - Budget Fit (0-30 pts): Over-budget properties are penalized
    - Distance Fit (0-30 pts): Closer distance is rewarded
    - Safety Score (0-20 pts): Normalized from property's 0-100 safety score
    - Trust Score (0-20 pts): Normalized from owner's 0-100 trust score

    Args:
        rental: RentalProperty object with rental details
        student: StudentProfile with student preferences

    Returns:
        RecommendationResult with overall score and component breakdown
    """

    # ========== BUDGET FIT COMPONENT (0-30 points) ==========
    # Rentals within budget: full 30 points
    # Rentals over budget: penalized based on excess percentage
    # Formula: if rent <= budget: 30 pts
    #          else: 30 * (budget / rent), minimum 0
    if rental.rent <= student.max_budget:
        budget_fit_score = 30.0
    else:
        # Over-budget penalty: reduce proportionally
        budget_ratio = student.max_budget / rental.rent
        budget_fit_score = max(0, 30.0 * budget_ratio)

    # ========== DISTANCE FIT COMPONENT (0-30 points) ==========
    # Reward closer distances, with diminishing returns beyond preferred distance
    # Max beneficial distance: 2x the preferred distance (beyond that = 0 points)
    # Formula: if distance <= preferred: 30 pts
    #          else: 30 * (preferred_distance / actual_distance)^0.8
    max_beneficial_distance = student.preferred_distance_km * 2.0

    if rental.distance_km <= student.preferred_distance_km:
        distance_fit_score = 30.0
    elif rental.distance_km <= max_beneficial_distance:
        # Penalize based on excess distance (with diminishing penalty)
        distance_ratio = student.preferred_distance_km / rental.distance_km
        distance_fit_score = 30.0 * (distance_ratio ** 0.8)
    else:
        distance_fit_score = 0.0

    # ========== SAFETY SCORE COMPONENT (0-20 points) ==========
    # Directly normalize safety score from 0-100 to 0-20 points
    safety_score_contrib = (rental.safety_score / 100.0) * 20.0

    # ========== TRUST SCORE COMPONENT (0-20 points) ==========
    # Directly normalize trust score from 0-100 to 0-20 points
    trust_score_contrib = (rental.trust_score / 100.0) * 20.0

    # ========== TOTAL SCORE ==========
    # Weighted sum of all components (clamped to 0-100)
    overall_score = min(100.0, budget_fit_score + distance_fit_score + 
                        safety_score_contrib + trust_score_contrib)

    return RecommendationResult(
        property_id=rental.property_id,
        overall_score=overall_score,
        rent=rental.rent,
        distance_km=rental.distance_km,
        safety_score=rental.safety_score,
        trust_score=rental.trust_score,
        campus_fit_score=rental.campus_fit_score,
        police_distance_km=rental.police_distance_km,
        cctv_coverage=rental.cctv_coverage,
        street_lighting=rental.street_lighting,
        transit_access=rental.transit_access,
        price_fairness=rental.price_fairness,
        response_time_minutes=rental.response_time_minutes,
        complaints_count=rental.complaints_count,
        budget_fit_score=budget_fit_score,
        distance_fit_score=distance_fit_score,
        safety_score_contrib=safety_score_contrib,
        trust_score_contrib=trust_score_contrib,
        description=rental.description,
        image_url=rental.image_url,
        is_direct_owner=rental.is_direct_owner,
        availability_status=rental.availability_status,
        payment_methods=rental.payment_methods,
        gender_preference=rental.gender_preference,
        reviews=rental.reviews,
        owner_id=rental.owner_id,
        owner_name=rental.owner_name,
        owner_average_rating=rental.owner_average_rating,
        owner_response_time_minutes=rental.owner_response_time_minutes,
        owner_complaints_count=rental.owner_complaints_count,
        agreement_completed=rental.agreement_completed,
        neighborhood=rental.neighborhood,
        city_zone=rental.city_zone,
        nearby_college=rental.nearby_college,
        college_distance_km=rental.college_distance_km,
        nearby_office_hub=rental.nearby_office_hub,
        office_distance_km=rental.office_distance_km,
        commute_minutes=rental.commute_minutes,
        women_safety_index=rental.women_safety_index,
        crime_index=rental.crime_index,
        night_transit_score=rental.night_transit_score,
        tiffin_options=rental.tiffin_options
    )


def recommend_rentals(
    student: StudentProfile,
    available_rentals: List[RentalProperty],
    top_n: int = 5
) -> List[RecommendationResult]:
    """
    Rank and recommend the best rental properties for a student.

    Args:
        student: StudentProfile with preferences
        available_rentals: List of available RentalProperty objects
        top_n: Number of top recommendations to return (default: 5)

    Returns:
        List of RecommendationResult objects, sorted by overall_score (descending)
    """

    # Score each rental
    scored_rentals = [
        calculate_rental_recommendation_score(rental, student)
        for rental in available_rentals
    ]

    # Sort by overall score (highest first)
    scored_rentals.sort(key=lambda x: x.overall_score, reverse=True)

    # Return top N recommendations
    return scored_rentals[:top_n]


def print_recommendation(recommendation: RecommendationResult) -> None:
    """Pretty-print a single recommendation with scoring details."""
    print(f"\n{'='*70}")
    print(f"Property ID: {recommendation.property_id}")
    if recommendation.description:
        print(f"Description: {recommendation.description}")
    print(f"{'='*70}")
    print(f"Overall Score: {recommendation.overall_score:.1f}/100")
    print(f"\nDetails:")
    print(f"  Rent: ${recommendation.rent}/month")
    print(f"  Distance: {recommendation.distance_km:.1f} km")
    print(f"  Safety Score: {recommendation.safety_score}/100")
    print(f"  Trust Score: {recommendation.trust_score}/100")
    print(f"\nScore Breakdown:")
    print(f"  Budget Fit: {recommendation.budget_fit_score:.1f}/30")
    print(f"  Distance Fit: {recommendation.distance_fit_score:.1f}/30")
    print(f"  Safety Contribution: {recommendation.safety_score_contrib:.1f}/20")
    print(f"  Trust Contribution: {recommendation.trust_score_contrib:.1f}/20")


# ============================================================================
# Example Usage & Testing
# ============================================================================

if __name__ == "__main__":
    # Define a student profile
    student = StudentProfile(
        max_budget=1500,
        preferred_distance_km=5.0
    )

    # Create sample rental properties
    rentals = [
        RentalProperty(
            property_id="PROP001",
            rent=1200,
            distance_km=3.5,
            safety_score=92,
            trust_score=88,
            description="Modern apartment near college, secured building"
        ),
        RentalProperty(
            property_id="PROP002",
            rent=1800,
            distance_km=2.0,
            safety_score=95,
            trust_score=85,
            description="Premium flat, very close to campus"
        ),
        RentalProperty(
            property_id="PROP003",
            rent=950,
            distance_km=8.5,
            safety_score=70,
            trust_score=72,
            description="Budget-friendly option, farther away"
        ),
        RentalProperty(
            property_id="PROP004",
            rent=1400,
            distance_km=4.2,
            safety_score=85,
            trust_score=90,
            description="Good balance of comfort and proximity"
        ),
        RentalProperty(
            property_id="PROP005",
            rent=2500,
            distance_km=1.5,
            safety_score=98,
            trust_score=95,
            description="Luxury accommodation, ultra-safe, very close"
        ),
    ]

    # Get recommendations
    print(f"\nRentSure Rental Recommendation Engine")
    print(f"Student Budget: ${student.max_budget}/month")
    print(f"Preferred Distance: {student.preferred_distance_km} km")

    recommendations = recommend_rentals(student, rentals, top_n=5)

    print(f"\n{'*'*70}")
    print(f"TOP 5 RECOMMENDATIONS FOR THIS STUDENT")
    print(f"{'*'*70}")

    for i, rec in enumerate(recommendations, 1):
        print(f"\n[Rank #{i}]", end="")
        print_recommendation(rec)

    print(f"\n{'='*70}")
