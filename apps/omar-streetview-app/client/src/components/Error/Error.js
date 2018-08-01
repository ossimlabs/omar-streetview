import React from "react";

const Error = (props) => {
  console.log(props);

  function handleClick(e) {
    e.preventDefault();
    props.history.go(-2);
  }

  return (
    <div className="text-center">
      <h1>{props.message} Sorry, an error has occurred while attempting to load the StreetView Image</h1>
      <button className="btn btn-default btn-large" onClick={handleClick}>Go Back to Previous Image</button>
    </div>
  )
};

export default Error;