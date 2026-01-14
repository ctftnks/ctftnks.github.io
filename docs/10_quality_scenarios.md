# 10. Quality Requirements

## 10.1 Performance Scenarios

- **Scenario:** 10 bots firing simultaneously.
- **Response:** Frame rate should not drop below 30 FPS.

## 10.2 Usability Scenarios

- **Scenario:** A new user opens the page.
- **Response:** They should be able to start a "Quick Game" within 2 clicks.

## 10.3 Testability

- **Scenario:** A bug is reported in bullet collision.
- **Response:** Developers should be able to write a unit test in `tests/entities/bullet.test.ts` to reproduce and fix the logic without running the full graphics engine.
