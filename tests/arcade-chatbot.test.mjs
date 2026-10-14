import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const chatbot = readFileSync("components/arcade/arcade-faq-chatbot.tsx", "utf8")
const chatbotCss = readFileSync("app/styles/arcade-chatbot.css", "utf8")
const layout = readFileSync("app/layout.tsx", "utf8")

test("Arcade FAQ chatbot is mounted globally", () => {
  assert.match(layout, /ArcadeFaqChatbot/)
  assert.match(layout, /arcade-chatbot\.css/)
  assert.match(layout, /<ArcadeFaqChatbot \/>/)
})

test("Arcade FAQ chatbot includes verified 2026 tier guidance", () => {
  assert.match(chatbot, /Trooper 50–74/)
  assert.match(chatbot, /Ranger 75–94/)
  assert.match(chatbot, /Champion 95–119/)
  assert.match(chatbot, /Legend 120\+/)
  assert.match(chatbot, /waterfall/i)
  assert.match(chatbot, /6,000/)
  assert.match(chatbot, /2,500/)
})

test("Arcade FAQ chatbot covers core user questions without an AI API dependency", () => {
  assert.match(chatbot, /2 Skill Badges equal 1 Arcade point/)
  assert.match(chatbot, /Prize Counter/)
  assert.match(chatbot, /Monthly Labs/)
  assert.match(chatbot, /shipping/i)
  assert.doesNotMatch(chatbot, /\bfetch\s*\(/)
  assert.doesNotMatch(chatbot, /OPENAI_API_KEY|GEMINI_API_KEY/)
})

test("Arcade FAQ chatbot is responsive and avoids the mobile bottom navigation", () => {
  assert.match(chatbotCss, /@media \(max-width: 640px\)/)
  assert.match(chatbotCss, /bottom: 84px/)
  assert.match(chatbotCss, /100dvh/)
})


test("Arcade FAQ chatbot exposes conversation controls", () => {
  assert.match(chatbot, /Chat menu/)
  assert.match(chatbot, /New chat/)
  assert.match(chatbot, /Suggested questions/)
  assert.match(chatbot, /About & sources/)
  assert.match(chatbot, /setMessages\(\[\]\)/)
  assert.match(chatbot, /Conversation history only lives in the current page session/)
  assert.match(chatbotCss, /arcade-chatbot-menu/)
  assert.match(chatbotCss, /arcade-chatbot-about/)
})
