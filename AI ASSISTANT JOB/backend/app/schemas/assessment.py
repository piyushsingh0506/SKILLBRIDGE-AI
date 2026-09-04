from pydantic import BaseModel
from typing import List


# =========================================================
# QUESTION RESPONSE
# =========================================================

class AssessmentQuestionResponse(BaseModel):

    id: int

    skill_id: int

    question: str

    option_a: str

    option_b: str

    option_c: str

    option_d: str

    class Config:
        from_attributes = True


# =========================================================
# ANSWER
# =========================================================

class AssessmentAnswerSubmit(BaseModel):

    question_id: int

    selected_answer: str


# =========================================================
# SUBMIT ASSESSMENT
# =========================================================

class AssessmentSubmit(BaseModel):

    career_goal: str

    answers: List[AssessmentAnswerSubmit]


# =========================================================
# RESULT
# =========================================================

class AssessmentResultResponse(BaseModel):

    attempt_id: int

    career_goal: str

    total_questions: int

    correct_answers: int

    score: float