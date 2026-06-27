"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const toBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const fromBase64 = (value: string) => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const deriveKey = async (password: string, salt: Uint8Array) => {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: 150000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

const encryptText = async (plainText: string, password: string) => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plainText)
  );

  const combined = new Uint8Array(
    salt.byteLength + iv.byteLength + cipherBuffer.byteLength
  );
  combined.set(salt, 0);
  combined.set(iv, salt.byteLength);
  combined.set(new Uint8Array(cipherBuffer), salt.byteLength + iv.byteLength);

  return toBase64(combined.buffer);
};

const decryptText = async (encryptedBase64: string, password: string) => {
  const combined = fromBase64(encryptedBase64.trim());
  const saltLength = 16;
  const ivLength = 12;

  if (combined.byteLength <= saltLength + ivLength) {
    throw new Error("密文格式不正确");
  }

  const salt = combined.slice(0, saltLength);
  const iv = combined.slice(saltLength, saltLength + ivLength);
  const cipherBytes = combined.slice(saltLength + ivLength);

  const key = await deriveKey(password, salt);
  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipherBytes
  );

  return decoder.decode(plainBuffer);
};

type Status = {
  type: "success" | "error" | null;
  message: string;
};

export default function AESPage() {
  const [inputText, setInputText] = useState("");
  const [password, setPassword] = useState("");
  const [outputText, setOutputText] = useState("");
  const [status, setStatus] = useState<Status>({ type: null, message: "" });
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<"input" | "output" | null>(null);

  const passwordStrength = useMemo(() => {
    if (!password) return "";
    if (password.length < 8) return "密码较弱，建议 8 位以上";
    if (password.length < 12) return "密码可用，建议更长并混合字符";
    return "密码强度良好";
  }, [password]);

  const handleEncrypt = async () => {
    if (!inputText.trim()) {
      setStatus({ type: "error", message: "请输入要加密的内容" });
      setOutputText("");
      return;
    }
    if (!password) {
      setStatus({ type: "error", message: "请输入加密密码" });
      setOutputText("");
      return;
    }

    try {
      setBusy(true);
      const encrypted = await encryptText(inputText, password);
      setOutputText(encrypted);
      setStatus({ type: "success", message: "加密成功，结果已生成" });
    } catch (err) {
      console.error(err);
      setOutputText("");
      setStatus({ type: "error", message: "加密失败，请重试" });
    } finally {
      setBusy(false);
    }
  };

  const handleDecrypt = async () => {
    if (!inputText.trim()) {
      setStatus({ type: "error", message: "请输入要解密的密文" });
      setOutputText("");
      return;
    }
    if (!password) {
      setStatus({ type: "error", message: "请输入解密密码" });
      setOutputText("");
      return;
    }

    try {
      setBusy(true);
      const decrypted = await decryptText(inputText, password);
      setOutputText(decrypted);
      setStatus({ type: "success", message: "解密成功" });
    } catch (err) {
      console.error(err);
      setOutputText("");
      setStatus({
        type: "error",
        message: "解密失败：密码错误或密文格式不正确",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async (value: string, target: "input" | "output") => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(target);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleClear = () => {
    setInputText("");
    setPassword("");
    setOutputText("");
    setStatus({ type: null, message: "" });
    setCopied(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setInputText(text);
      setStatus({ type: "success", message: `已加载文件：${file.name}` });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "文件读取失败" });
    }
  };

  const handleDownload = () => {
    if (!outputText) {
      setStatus({ type: "error", message: "没有可下载的内容" });
      return;
    }

    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aes-result-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatus({ type: "success", message: "文件已下载" });
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          ← 返回首页
        </Link>
      </div>

      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            AES 长文本加密/解密
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            纯前端 AES-GCM 加密工具，使用 PBKDF2 从密码派生密钥，不会上传任何数据。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                输入内容（明文或密文）
              </label>
              <div className="flex gap-2">
                <label className="cursor-pointer text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  📁 加载文件
                  <input
                    type="file"
                    accept=".txt,.md,.json,.xml,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => handleCopy(inputText, "input")}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {copied === "input" ? "已复制" : "复制输入"}
                </button>
              </div>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[200px] w-full resize-y rounded-md border border-gray-300 p-3 font-mono text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="粘贴需要加密的明文，或需要解密的密文..."
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                加密密码（Key）
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="请输入解密或加密用的密码"
              />
              {passwordStrength && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{passwordStrength}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleEncrypt}
                disabled={busy}
                className="inline-flex flex-1 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                🔒 加密
              </button>
              <button
                onClick={handleDecrypt}
                disabled={busy}
                className="inline-flex flex-1 items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                🔓 解密
              </button>
              <button
                onClick={handleClear}
                className="inline-flex flex-1 items-center justify-center rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
              >
                🧹 清空
              </button>
            </div>

            {status.type && (
              <div
                className={`rounded-md px-3 py-2 text-sm ${
                  status.type === "success"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200"
                }`}
              >
                {status.message}
              </div>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400">
              提示：输出结果包含随机盐和 IV，必须使用相同密码才能解密。
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">结果</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">加密密文或解密后的明文会显示在这里</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  💾 下载
                </button>
                <button
                  onClick={() => handleCopy(outputText, "output")}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {copied === "output" ? "已复制" : "复制结果"}
                </button>
              </div>
            </div>

            <textarea
              value={outputText}
              readOnly
              className="min-h-[260px] w-full resize-y rounded-md border border-gray-300 bg-gray-50 p-3 font-mono text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              placeholder="结果会显示在这里..."
            />

            <div className="space-y-2 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-gray-900 dark:text-gray-300">
              <p>• 使用 AES-GCM（256 位密钥）+ PBKDF2 派生；随机盐与 IV 内嵌在密文中。</p>
              <p>• 纯浏览器侧运行，不会上传任何文本或密码。</p>
              <p>• 密文为 Base64，保留完整内容即可解密。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
