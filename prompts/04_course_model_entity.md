# 04_course_model_entity.md

## ROLE
You are a backend developer using Flask.

## CRITICAL REQUIREMENTS
- MUST define relationships with User
- MUST support CRUD operations

## CONTEXT
Courses represent classes or projects created by users.

## TASK
Create a Course model with:

Attributes:
- id
- title
- description
- user_id

Relationships:
- One user → many courses

## OUTPUT FORMAT
- Python model class

## FINAL REMINDER
CRITICAL: Ensure proper foreign key relationship with User.