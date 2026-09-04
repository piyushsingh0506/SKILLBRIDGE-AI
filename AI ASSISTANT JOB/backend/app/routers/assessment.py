from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.database.models import (
    User,
    Student,
    Skill,
    StudentSkill,
    AssessmentQuestion,
    AssessmentAttempt,
    AssessmentAnswer
)

from app.schemas.assessment import (
    AssessmentQuestionResponse,
    AssessmentSubmit,
    AssessmentResultResponse
)

from app.routers.auth import get_current_user


router = APIRouter(
    prefix="/assessments",
    tags=["Assessments"]
)


# =========================================================
# HELPER
# =========================================================

def check_student(current_user: User):

    if current_user.role != "student":

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access assessments"
        )


# =========================================================
# GET QUESTIONS
# =========================================================

@router.get(
    "/questions",
    response_model=list[AssessmentQuestionResponse]
)
def get_assessment_questions(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)

):

    check_student(current_user)

    questions = (
        db.query(AssessmentQuestion)
        .order_by(AssessmentQuestion.id)
        .all()
    )

    if not questions:

        raise HTTPException(
            status_code=404,
            detail="No assessment questions found"
        )

    return questions


# =========================================================
# SUBMIT ASSESSMENT
# =========================================================

@router.post(
    "/submit",
    response_model=AssessmentResultResponse
)
def submit_assessment(

    data: AssessmentSubmit,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)

):

    check_student(current_user)


    # -----------------------------------------------------
    # Find student
    # -----------------------------------------------------

    student = (
        db.query(Student)
        .filter(
            Student.user_id == current_user.id
        )
        .first()
    )


    if not student:

        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )


    # -----------------------------------------------------
    # Validate answers
    # -----------------------------------------------------

    if not data.answers:

        raise HTTPException(
            status_code=400,
            detail="Please answer at least one question"
        )


    correct_count = 0

    total_questions = len(data.answers)


    # Store information for skill calculation

    skill_scores = {}


    # -----------------------------------------------------
    # Create assessment attempt
    # -----------------------------------------------------

    attempt = AssessmentAttempt(

        student_id=student.id,

        career_goal=data.career_goal,

        total_questions=total_questions,

        correct_answers=0,

        score=0

    )


    db.add(attempt)

    db.commit()

    db.refresh(attempt)


    # -----------------------------------------------------
    # Process answers
    # -----------------------------------------------------

    for submitted_answer in data.answers:


        question = (
            db.query(AssessmentQuestion)
            .filter(
                AssessmentQuestion.id
                == submitted_answer.question_id
            )
            .first()
        )


        if not question:

            continue


        selected = (
            submitted_answer.selected_answer
            .upper()
        )


        correct = (
            question.correct_answer
            .upper()
        )


        is_correct = selected == correct


        if is_correct:

            correct_count += 1


        # -------------------------------------------------
        # Skill score calculation
        # -------------------------------------------------

        skill_id = question.skill_id


        if skill_id not in skill_scores:

            skill_scores[skill_id] = {
                "correct": 0,
                "total": 0
            }


        skill_scores[skill_id]["total"] += 1


        if is_correct:

            skill_scores[skill_id]["correct"] += 1


        # -------------------------------------------------
        # Store answer
        # -------------------------------------------------

        answer = AssessmentAnswer(

            attempt_id=attempt.id,

            question_id=question.id,

            selected_answer=selected,

            is_correct=is_correct

        )


        db.add(answer)


    # -----------------------------------------------------
    # Overall score
    # -----------------------------------------------------

    score = (
        correct_count / total_questions
    ) * 100


    attempt.correct_answers = correct_count

    attempt.score = round(score, 2)


    # -----------------------------------------------------
    # Update Student Skills
    # -----------------------------------------------------

    for skill_id, result in skill_scores.items():

        skill_score = (
            result["correct"]
            / result["total"]
        ) * 100


        existing_skill = (
            db.query(StudentSkill)
            .filter(
                StudentSkill.student_id
                == student.id,

                StudentSkill.skill_id
                == skill_id
            )
            .first()
        )


        if existing_skill:

            existing_skill.score = round(
                skill_score,
                2
            )


        else:

            new_skill = StudentSkill(

                student_id=student.id,

                skill_id=skill_id,

                score=round(
                    skill_score,
                    2
                )

            )

            db.add(new_skill)


    db.commit()


    return {

        "attempt_id": attempt.id,

        "career_goal": data.career_goal,

        "total_questions": total_questions,

        "correct_answers": correct_count,

        "score": round(score, 2)

    }