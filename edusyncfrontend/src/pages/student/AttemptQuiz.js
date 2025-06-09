import { useEffect, useState } from "react";
import API from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";

const AttemptQuiz = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [assessmentId, setAssessmentId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [alreadyAttempted, setAlreadyAttempted] = useState(false);

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

  const userId = getUserIdFromToken();

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        console.log("Fetching quiz for courseId:", courseId);
        
        // ✅ Fixed this line: changed RegExp to string template literal
        const res = await API.get(`/Assessment/student/quiz/${courseId}`);
        const { assessmentId, questions: rawQuestions, alreadyAttempted } = res.data;

        if (alreadyAttempted) {
          setAlreadyAttempted(true);
          setLoading(false);
          return;
        }

        setAssessmentId(assessmentId);

        const parsedQuestions = JSON.parse(rawQuestions || "[]");
        const formatted = parsedQuestions.map(q => ({
          questionId: q.QuestionId,
          questionText: q.QuestionText,
          options: q.Options,
          correctAnswer: q.CorrectAnswer,
        }));

        setQuestions(formatted);
      } catch (err) {
        console.error("Error loading quiz:", err);
        setError("❌ Failed to load quiz. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [courseId]);

  const handleOptionChange = (questionId, selectedOption) => {
    setAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
  };

  const handleSubmit = async () => {
    if (!userId || !assessmentId || questions.length === 0) return;

    const selectedOptions = questions.map(q => ({
      questionId: q.questionId,
      selectedOption: answers[q.questionId] || "",
    }));

    const score = selectedOptions.reduce((total, item) => {
      const correct = questions.find(q => q.questionId === item.questionId)?.correctAnswer;
      return total + (item.selectedOption === correct ? 1 : 0);
    }, 0);

    setFinalScore(score);

    const payload = {
      assessmentId,
      courseId,
      score,
      selectedOptions,
    };

    try {
      await API.post("/Quiz/submit", payload);
      setShowModal(true);
    } catch (error) {
      if (error.response?.status === 400) {
        alert("⚠ You have already submitted this quiz.");
        setAlreadyAttempted(true);
      } else {
        console.error("Submission failed:", error);
        alert("❌ Quiz submission failed. Please try again.");
      }
    }
  };

  const allAnswered = questions.length > 0 && questions.every(q => answers[q.questionId]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center mt-5">
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Loading quiz...</span>
      </div>
    );
  }

  if (alreadyAttempted) {
    return (
      <div className="container mt-4 text-center">
        <h4 className="text-danger">⚠ You have already attempted this quiz.</h4>
        <Button className="mt-3" onClick={() => navigate("/student/ViewAssessmentResults")}>
          View Your Results
        </Button>
      </div>
    );
  }

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📝 Attempt Quiz</h2>

      {questions.map((q, index) => (
        <div key={q.questionId} className="mb-4">
          <h5>
            Q{index + 1}. {q.questionText}
          </h5>
          {q.options.map((opt, i) => {
            const inputId = `q${index}-opt${i}`;
            return (
              <div className="form-check" key={inputId}>
                <input
                  className="form-check-input"
                  type="radio"
                  id={inputId}
                  name={`question-${q.questionId}`}
                  value={opt}
                  checked={answers[q.questionId] === opt}
                  onChange={() => handleOptionChange(q.questionId, opt)}
                />
                <label className="form-check-label" htmlFor={inputId}>
                  {opt}
                </label>
              </div>
            );
          })}
        </div>
      ))}

      <button
        className="btn btn-success mt-3"
        onClick={handleSubmit}
        disabled={!allAnswered}
      >
        Submit Quiz
      </button>

      {/* Submission Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header
          closeButton
          style={{ backgroundColor: "#e6f7f1", borderBottom: "none" }}
        >
          <Modal.Title style={{ fontWeight: "bold", color: "#2e7d32" }}>
            ✅ Quiz Submitted Successfully!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ textAlign: "center", backgroundColor: "#f9fefb" }}>
          <div style={{ fontSize: "60px", marginBottom: "15px", color: "#4caf50" }}>
            🎯
          </div>
          <h4>Congratulations! Your quiz has been submitted.</h4>
        </Modal.Body>
        <Modal.Footer
          style={{ backgroundColor: "#f9fefb", borderTop: "none", justifyContent: "center" }}
        >
          <Button
            variant="success"
            onClick={() =>
              navigate("/student/ViewAssessmentResults", {
                state: {
                  score: finalScore,
                  total: questions.length,
                  answers: questions.map(q => ({
                    questionId: q.questionId,
                    selectedOption: answers[q.questionId] || "",
                  })),
                  questions,
                },
              })
            }
          >
            View Result
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AttemptQuiz;