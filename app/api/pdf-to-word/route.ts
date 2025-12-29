import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';

export const runtime = 'nodejs';

const MAX_SIZE = 20 * 1024 * 1024;

GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/legacy/build/pdf.worker.mjs',
  import.meta.url,
).toString();

const extractText = async (data: Uint8Array) => {
  const doc = await getDocument({ data }).promise;
  let text = '';

  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .filter(Boolean);
    text += strings.join(' ') + '\n\n';
  }

  return text.trim();
};

const buildDocxBuffer = async (content: string) => {
  const paragraphs = content
    ? content.split(/\n{2,}/).map((block) =>
        new Paragraph({
          spacing: { after: 100 },
          children: [new TextRun({ text: block.trim(), size: 22 })],
        })
      )
    : [new Paragraph('未提取到文本')];

  const doc = new Document({ sections: [{ children: paragraphs }] });
  return Packer.toBuffer(doc);
};

const baseName = (name: string) => {
  const idx = name.lastIndexOf('.');
  return idx === -1 ? name : name.slice(0, idx);
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: '缺少文件' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ message: '仅支持 PDF 文件' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: '单个文件需小于 20MB' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    const text = await extractText(data);
    const docBuffer = await buildDocxBuffer(text);
    const filename = `${baseName(file.name) || 'converted'}.docx`;

    return new NextResponse(docBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: '转换失败，请稍后重试' }, { status: 500 });
  }
}
