import React from "react";
import styled from "styled-components";
// import SubmitSuccessModal from "./SubmitSuccessModal";
// import SubmitFailureModal from "./SubmitFailureModal";
import ReactHtmlParser from "html-react-parser";
import decodeHTML from "../../utilities/decodeHTML";
import useSettingsStore from "../../globalState/useSettingsStore";
import useStore from "../../globalState/useStore";
import PromptUnload from "../../utilities/PromptUnload";
import axios from "axios";
import getSubmitRequest from "../../utilities/getSubmitRequest";

const getLangObj = (state) => state.langObj;
const getTransmittingData = (state) => state.transmittingData;
const getSetTransmittingData = (state) => state.setTransmittingData;
const getCheckInternetConnection = (state) => state.checkInternetConnection;
const getSetCheckInternetConnection = (state) =>
  state.setCheckInternetConnection;
const getConfigObj = (state) => state.configObj;
// const getSetTrigTransOKModal = (state) => state.setTriggerTransmissionOKModal;
const getSetDisplayGoodbyeMessage = (state) => state.setDisplayGoodbyeMessage;
const getSetDisplayBelowButtonText = (state) => state.setDisplayBelowButtonText;

const SubmitResultsButtonBaserow = (props) => {
  // STATE
  const langObj = useSettingsStore(getLangObj);
  let transmittingData = useStore(getTransmittingData);
  const setTransmittingData = useStore(getSetTransmittingData);
  let checkInternetConnection = useStore(getCheckInternetConnection);
  const setCheckInternetConnection = useStore(getSetCheckInternetConnection);
  const configObj = useSettingsStore(getConfigObj);
  // const setTriggerTransmissionOKModal = useStore(getSetTrigTransOKModal);
  const setDisplayGoodbyeMessage = useStore(getSetDisplayGoodbyeMessage);
  const checkInternetMessage =
    ReactHtmlParser(decodeHTML(langObj.checkInternetMessage)) || "";
  const setDisplayBelowButtonText = useStore(getSetDisplayBelowButtonText);

  const btnTransferText =
    ReactHtmlParser(decodeHTML(langObj.btnTransfer)) || "";

  const handleClick = (e) => {
    e.preventDefault();
    setDisplayBelowButtonText(true);
    // setup for client-side internet connection fail case
    setTransmittingData(true);
    setCheckInternetConnection(false);

    const timeoutId = setTimeout(() => {
      setTransmittingData(false);
      setCheckInternetConnection(true);
      setDisplayBelowButtonText(false);
    }, 10000);

    console.log(JSON.stringify(props.results, null, 2));

    const request = getSubmitRequest(configObj, props.results);

    if (request === null) {
      clearTimeout(timeoutId);
      setTransmittingData(false);
      setCheckInternetConnection(true);
      setDisplayBelowButtonText(false);
      return;
    }

    axios({
      method: "POST",
      url: request.url,
      headers: request.headers,
      data: request.data,
    })
      .then((response) => {
        console.log(response);
        clearTimeout(timeoutId);
        setTransmittingData(false);
        setCheckInternetConnection(false);
        setDisplayGoodbyeMessage(true);
        // setTriggerTransmissionOKModal(true);
      })
      .catch((error) => {
        console.log(error);
        clearTimeout(timeoutId);

        // Keep the submission button and show the retry warning; participants
        // should not be asked to download or email their own data.
        setTransmittingData(false);
        setCheckInternetConnection(true);
        setDisplayBelowButtonText(false);
      });

    console.log("submission processed");
  };

  return (
    <React.Fragment>
      <PromptUnload />
      {/* <SubmitSuccessModal /> */}
      {/* <SubmitFailureModal /> */}
      {transmittingData ? (
        <TransmittingSpin />
      ) : (
        <StyledSubmitDataButton
          type="button"
          tabIndex={0}
          onClick={(e) => handleClick(e)}
          disabled={transmittingData}
        >
          {btnTransferText}
        </StyledSubmitDataButton>
      )}
      {checkInternetConnection && (
        <WarningDiv>{checkInternetMessage}</WarningDiv>
      )}
    </React.Fragment>
  );
};
export default SubmitResultsButtonBaserow;

const StyledSubmitDataButton = styled.button`
  border-color: #2e6da4;
  color: white;
  font-size: 1.2em;
  font-weight: bold;
  padding: 0.25em 1em;
  border-radius: 3px;
  text-decoration: none;
  width: auto;
  height: 50px;
  justify-self: right;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
  margin-bottom: 20px;
  background-color: ${({ theme, active }) =>
    active ? theme.secondary : theme.primary};

  &:hover {
    background-color: ${({ theme }) => theme.secondary};
  }

  &:focus {
    background-color: ${({ theme }) => theme.focus};
  }
`;

const TransmittingSpin = styled.div`
  display: inline-block;
  width: 50px;
  height: 50px;
  margin-top: 30px;
  margin-bottom: 20px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #337ab7;
  animation: spin 1s ease-in-out infinite;
  -webkit-animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to {
      -webkit-transform: rotate(360deg);
    }
  }
  @-webkit-keyframes spin {
    to {
      -webkit-transform: rotate(360deg);
    }
  }
`;

const WarningDiv = styled.div`
  display: flex;
  padding-top: 30px;
  justify-content: center;
  align-items: center;
  width: 70vw;
  height: fit-content;
  font-size: 1.2em;
  text-align: center;
  background-color: #ffc067;
  padding: 5px;
  margin-bottom: 30px;
  border-radius: 10px;
  font-weight: bold;
`;

// const DisabledButton = styled.button`
//   border-color: lightgray;
//   color: white;
//   font-size: 1.2em;
//   font-weight: bold;
//   padding: 0.25em 1em;
//   border-radius: 3px;
//   text-decoration: none;
//   width: 200px;
//   height: 50px;
//   justify-self: right;
//   margin-right: 35px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   margin-top: 30px;
//   margin-bottom: 20px;
//   background-color: lightgray;
// `;
