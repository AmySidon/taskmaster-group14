# 05_task_model_entity.md

## ROLE
You are an expert backend developer.

## CRITICAL REQUIREMENTS
- MUST include all required attributes
- MUST define relationships properly
- MUST support CRUD operations

## CONTEXT
Tasks belong to courses and track assignments.

## TASK
Create a Task model with:

Attributes:
- id
- title
- description
- due_date
- priority (Low, Medium, High)
- status (Pending, In Progress, Completed)
- course_id

Relationships:
- One course → many tasks

## OUTPUT FORMAT
- SQLAlchemy model

## FINAL REMINDER
CRITICAL: Ensure relationships and attributes are correctly mapped.