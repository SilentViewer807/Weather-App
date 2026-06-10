import React from "react";
import "./Footer.css"

const Footer = () => {
  // Elements
  return (
    <div className="footer">
      <p className="notice">© 2025-2026 Philip Taylor</p>
      <p className="note">
        Made with
        <span aria-hidden="true"> ♥ </span>
        <span className="sr-only"> love </span>
        using React JS
      </p>
    </div>
  );
};

export default Footer;
