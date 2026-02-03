"""
RentSure Trust Score Calculator

A simple, explainable AI-based trust scoring system for rental accommodations.
Converts rental owner behavior into a clear Trust Score (0-100) with a trust label.
"""


def calculate_trust_score(
    average_rating: float,
    response_time_minutes: int,
    complaints_count: int,
    agreement_completed: bool
) -> tuple[int, str]:
    """
    Calculate a Tenant-Owner Trust Score based on rental owner behavior.

    Args:
        average_rating (float): Owner's average rating (1.0 to 5.0)
        response_time_minutes (int): How quickly owner responds to inquiries (in minutes)
        complaints_count (int): Number of complaints received from tenants
        agreement_completed (bool): Whether rental agreement was completed

    Returns:
        tuple: (trust_score: int, trust_label: str)
            - trust_score: Integer between 0 and 100
            - trust_label: One of "High Trust", "Medium Trust", or "Low Trust"
    """

    # Initialize score at 50 (neutral baseline)
    score = 50.0

    # ========== RATING COMPONENT (0-30 points) ==========
    # Normalize rating from 1.0-5.0 scale to 0-30 point contribution
    # Formula: (rating - 1) / 4 * 30
    # 1.0 rating = 0 points, 5.0 rating = 30 points
    rating_score = ((average_rating - 1.0) / 4.0) * 30.0
    score += rating_score

    # ========== RESPONSE TIME COMPONENT (0-15 points) ==========
    # Faster response = higher trust
    # Max beneficial response time: 24 hours (1440 minutes)
    # Beyond that, no additional penalty
    # Formula: max(0, 100 - (time / 1440) * 100) * 0.15
    max_response_minutes = 1440  # 24 hours
    if response_time_minutes <= max_response_minutes:
        response_score = (1.0 - (response_time_minutes / max_response_minutes)) * 15.0
    else:
        response_score = 0.0  # Very slow response = no bonus
    score += response_score

    # ========== COMPLAINTS COMPONENT (0 to -30 points) ==========
    # Each complaint reduces trust: 5 points per complaint
    # Can go negative to reflect serious red flags
    complaint_score = -complaints_count * 5
    score += complaint_score

    # ========== AGREEMENT COMPLETION BONUS (0-10 points) ==========
    # Completed agreement = reliable, trustworthy owner
    agreement_bonus = 10.0 if agreement_completed else 0.0
    score += agreement_bonus

    # ========== CLAMP SCORE TO 0-100 RANGE ==========
    # Ensure score is always between 0 and 100
    final_score = max(0, min(100, int(score)))

    # ========== DETERMINE TRUST LABEL ==========
    if final_score >= 75:
        trust_label = "High Trust"
    elif final_score >= 50:
        trust_label = "Medium Trust"
    else:
        trust_label = "Low Trust"

    return final_score, trust_label


# ============================================================================
# Example Usage & Testing
# ============================================================================

if __name__ == "__main__":
    # Test Case 1: Excellent owner
    score1, label1 = calculate_trust_score(
        average_rating=4.8,
        response_time_minutes=30,
        complaints_count=0,
        agreement_completed=True
    )
    print(f"Test 1 - Excellent Owner: {score1}/100 ({label1})")

    # Test Case 2: Average owner
    score2, label2 = calculate_trust_score(
        average_rating=3.5,
        response_time_minutes=480,  # 8 hours
        complaints_count=1,
        agreement_completed=True
    )
    print(f"Test 2 - Average Owner: {score2}/100 ({label2})")

    # Test Case 3: Problematic owner
    score3, label3 = calculate_trust_score(
        average_rating=2.2,
        response_time_minutes=2000,  # >24 hours
        complaints_count=3,
        agreement_completed=False
    )
    print(f"Test 3 - Problematic Owner: {score3}/100 ({label3})")

    # Test Case 4: Edge case - minimum input
    score4, label4 = calculate_trust_score(
        average_rating=1.0,
        response_time_minutes=10,
        complaints_count=0,
        agreement_completed=True
    )
    print(f"Test 4 - Minimum Rating: {score4}/100 ({label4})")

    # Test Case 5: Edge case - maximum complaints
    score5, label5 = calculate_trust_score(
        average_rating=5.0,
        response_time_minutes=5,
        complaints_count=10,
        agreement_completed=True
    )
    print(f"Test 5 - High Rating, Many Complaints: {score5}/100 ({label5})")
