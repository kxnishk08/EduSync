import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <Card.Title>{course.title}</Card.Title>
        <Card.Text>
          {course.description?.length > 150
            ? course.description.substring(0, 150) + '...'
            : course.description}
        </Card.Text>
        <Button as={Link} to={`/course/${course.courseId}`} variant="primary">
          View Course
        </Button>
      </Card.Body>
    </Card>
  );
};

export default CourseCard;
