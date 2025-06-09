
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Alert, Card, Spinner, Badge, Row, Col } from "react-bootstrap";
import API from "../../services/api";
import {jwtDecode} from "jwt-decode";

// Utility to extract userId from token
const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return (
      decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
      decoded.sub ||
      null
    );
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
};

const ViewResult = () => {
  const { assessmentId, userId } = useParams();
  const navigate = useNavigate();


  // Use studentId from URL if exists, else fallback to logged-in user id
  const currentUserId = getUserIdFromToken();
  const resultUserId = userId || currentUserId;

    // console.log("studentid  view result page :",userId)
    // console.log("current id  view result page :",currentUserId)


  console.log("result user id  view Result page ",resultUserId);

  const [questions, setQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [unattemptedCount, setUnattemptedCount] = useState(0);

  useEffect(() => {
    if (!resultUserId || !assessmentId) {
      setError("Missing student or assessment information.");
      setLoading(false);
      return;
    }

    const fetchResult = async () => {
      try {
        const res = await API.get(`/Results/by-user/${resultUserId}/assessment/${assessmentId}`);
        if (!res.data || !res.data.questions) {
          setError("No result data found.");
          setLoading(false);
          return;
        }

        setScore(res.data.score);

        const transformedQuestions = res.data.questions.map((q) => ({
          questionId: q.questionId || q.QuestionId,
          questionText: q.questionText || q.Question || "",
          options: q.options || q.Options || [],
          selectedOption: q.selectedOption || q.SelectedOption || null,
          correctOption: q.correctAnswer || q.correctOption || q.CorrectOption || null,
        }));

        setQuestions(transformedQuestions);

        let correct = 0, incorrect = 0, unattempted = 0;
        transformedQuestions.forEach((q) => {
          if (!q.selectedOption || q.selectedOption === "Unattempted") {
            unattempted++;
          } else if (q.selectedOption === q.correctOption) {
            correct++;
          } else {
            incorrect++;
          }
        });

        setCorrectCount(correct);
        setIncorrectCount(incorrect);
        setUnattemptedCount(unattempted);
      } catch (err) {
        console.error("Failed to load result", err);
        setError("Could not fetch result data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [resultUserId, assessmentId]);

  if (loading) {
    return (
      <div className="text-center mt-4">
        <Spinner animation="border" role="status" />
        <div>Loading Results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <Alert variant="warning">⚠️ {error}</Alert>
        <Button variant="primary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  const total = questions.length || 0;
  const percentage = total > 0 ? ((score / total) * 100).toFixed(0) : 0;
  const accuracy = total > 0 ? ((correctCount / total) * 100).toFixed(1) : 0;

  return (
    <div className="container mt-2 mb-3">
      <div className="text-center mb-2">
        <h2>📊 Full Quiz Analysis</h2>
       
      </div>

      <Card className="mb-2 p-2 shadow-lg rounded-4" style={{ background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)" }}>
         <h4 className="my-3 text-center text-black">
          Score: <span className="text-black">{score} / {total}</span>
        </h4>
        <Row className="text-center g-4 flex-row justify-content-center">
          <Col xs={6} md={2}>
            <Badge  bg="white" className="fs-6 px-3 py-2 shadow-sm text-dark fw-semibold">Total: {total}</Badge>
          </Col>
          <Col xs={6} md={2}>
            <Badge  bg="white" className="fs-6 px-3 py-2 shadow-sm text-dark fw-semibold">Correct: {correctCount}</Badge>
          </Col>
          <Col xs={6} md={2}>
            <Badge  bg="white" className="fs-6 px-3 py-2 shadow-sm text-dark fw-semibold">Incorrect: {incorrectCount}</Badge>
          </Col>
          <Col xs={6} md={2}>
            <Badge  bg="white" className="fs-6 px-3 py-2 shadow-sm text-dark fw-semibold">Unattempted: {unattemptedCount}</Badge>
          </Col>
          <Col xs={6} md={2}>
            <Badge  bg="white" className="fs-6 px-3 py-2 shadow-sm text-dark fw-semibold">Accuracy: {accuracy}%</Badge>
          </Col>
        </Row>
      </Card>

      {questions.length > 0 ? (
        questions.map((q, idx) => (
          <Card
            key={q.questionId}
            className="mb-3"
            border={
              !q.selectedOption || q.selectedOption === "Unattempted"
                ? "secondary"
                : q.selectedOption === q.correctOption
                  ? "success"
                  : "danger"
            }
          >
            <Card.Body>
              <Card.Title>Q{idx + 1}: {q.questionText}</Card.Title>
              <ul>
                {q.options.map((opt, i) => {
                  const label = String.fromCharCode(65 + i);
                  const isSelected = q.selectedOption === label || q.selectedOption === opt;
                  const isCorrect = q.correctOption === label || q.correctOption === opt;
                  return (
                    <li
                      key={label}
                      style={{
                        fontWeight: isCorrect ? "bold" : "normal",
                        color: isSelected
                          ? isCorrect
                            ? "green"
                            : "red"
                          : isCorrect
                            ? "green"
                            : "black",
                      }}
                    >
                      {label}: {opt} {isCorrect && "✔"} {isSelected && !isCorrect && "✖"}
                    </li>
                  );
                })}
              </ul>
              <p>
                <strong>Selected:</strong> {q.selectedOption || "Unattempted"} | <strong>Correct:</strong> {q.correctOption}
              </p>
            </Card.Body>
          </Card>
        ))
      ) : (
        <p className="text-center text-muted">No questions available.</p>
      )}

      <div className="text-center mt-5">
        <Button variant="secondary" size="lg" onClick={() => navigate(-1)}>
          🔙 Back
        </Button>
      </div>
    </div>
  );
};

export default ViewResult;
