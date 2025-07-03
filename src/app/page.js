"use client";
import React, { useState } from "react";
import ChatbotWidget from "../app/components/ChatbotWidget/page"; // adjust if path differs

const Home = () => {

  return (
    <div>
      {/* Chatbot Widget (bottom-right fixed) */}
      <ChatbotWidget />
    </div>
      
  );
};

export default Home;
