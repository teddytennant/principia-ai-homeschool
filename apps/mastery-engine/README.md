# mastery-engine

NestJS microservice for mastery evaluation (MGPD).

- Exposes POST /mastery/evaluate
- Calls Python logistic regression model for inference
- Returns { score, tier } per MGPD thresholds
