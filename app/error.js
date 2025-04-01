"use client"; // error.js لازم يكون Client Component

import React from 'react';

export default function Error({ error, reset }) {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '100vh' }}>
      <h2 className="text-danger">Something went wrong!</h2>
      <p>{error?.message || "An unexpected error occurred."}</p>
      <button className="btn btn-primary mt-3" onClick={() => reset()}>
        Try Again
      </button>
    </div>
  );
}
