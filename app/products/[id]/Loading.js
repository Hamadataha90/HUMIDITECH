import React from "react";
import { Spinner } from "react-bootstrap";

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100px" }}>
      <Spinner animation="border" role="status" className="me-2">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      <strong>{message}</strong>
    </div>
  );
};

export default Loading;
