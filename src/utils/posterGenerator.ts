export interface PosterData {
  word: string;
  meaning: string;
  phonetic?: string;
  timeUsed: number;
  isSuccess: boolean;
  streak: number;
  hintsUsed: number;
  gameMode: 'classic' | 'practice' | 'challenge';
}

const CANVAS_WIDTH = 750;
const CANVAS_HEIGHT = 1334;

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawGradientBackground(ctx: CanvasRenderingContext2D, isSuccess: boolean) {
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  if (isSuccess) {
    gradient.addColorStop(0, '#14B8A6');
    gradient.addColorStop(0.5, '#0D9488');
    gradient.addColorStop(1, '#0F766E');
  } else {
    gradient.addColorStop(0, '#F97316');
    gradient.addColorStop(0.5, '#EA580C');
    gradient.addColorStop(1, '#C2410C');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * CANVAS_WIDTH;
    const y = Math.random() * CANVAS_HEIGHT;
    const radius = 20 + Math.random() * 60;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawLogo(ctx: CanvasRenderingContext2D) {
  const centerX = CANVAS_WIDTH / 2;
  const logoY = 120;

  drawRoundedRect(ctx, centerX - 60, logoY, 120, 120, 30);
  const logoGradient = ctx.createLinearGradient(centerX - 60, logoY, centerX + 60, logoY + 120);
  logoGradient.addColorStop(0, '#FFFFFF');
  logoGradient.addColorStop(1, '#F0FDFA');
  ctx.fillStyle = logoGradient;
  ctx.fill();

  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 4;
  drawRoundedRect(ctx, centerX - 60, logoY, 120, 120, 30);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.shadowColor = 'transparent';

  ctx.fillStyle = '#0D9488';
  ctx.font = 'bold 56px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🧩', centerX, logoY + 60);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('每日单词拼图', centerX, logoY + 140);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = '22px Arial, sans-serif';
  ctx.fillText('Daily Word Puzzle', centerX, logoY + 190);
}

function drawResultBadge(ctx: CanvasRenderingContext2D, isSuccess: boolean) {
  const centerX = CANVAS_WIDTH / 2;
  const badgeY = 320;

  ctx.font = '80px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isSuccess ? '🎉' : '💪', centerX, badgeY);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 48px Arial, sans-serif';
  ctx.fillText(isSuccess ? '挑战成功！' : '继续加油！', centerX, badgeY + 70);
}

function drawWordCard(ctx: CanvasRenderingContext2D, data: PosterData) {
  const cardX = 60;
  const cardY = 480;
  const cardWidth = CANVAS_WIDTH - 120;
  const cardHeight = 320;

  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;

  drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, 24);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  ctx.shadowColor = 'transparent';

  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 56px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(data.word.toUpperCase(), CANVAS_WIDTH / 2, cardY + 50);

  if (data.phonetic) {
    ctx.fillStyle = '#6B7280';
    ctx.font = '26px Arial, sans-serif';
    ctx.fillText(data.phonetic, CANVAS_WIDTH / 2, cardY + 120);
  }

  ctx.fillStyle = '#374151';
  ctx.font = '28px Arial, sans-serif';
  const meaningY = data.phonetic ? cardY + 170 : cardY + 140;
  const words = data.meaning.split('');
  let line = '';
  let lineY = meaningY;
  const maxWidth = cardWidth - 60;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, CANVAS_WIDTH / 2, lineY);
      line = words[i];
      lineY += 36;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, CANVAS_WIDTH / 2, lineY);
}

function drawStats(ctx: CanvasRenderingContext2D, data: PosterData) {
  const startY = 860;
  const cardWidth = (CANVAS_WIDTH - 150) / 3;
  const cardHeight = 160;
  const cardX = 50;
  const gap = 30;

  const stats = [
    {
      icon: '⏱️',
      value: `${data.timeUsed}秒`,
      label: '用时',
      color: '#14B8A6',
    },
    {
      icon: '🔥',
      value: `${data.streak}天`,
      label: '连续打卡',
      color: '#F97316',
    },
    {
      icon: '💡',
      value: `${data.hintsUsed}次`,
      label: '使用提示',
      color: '#EAB308',
    },
  ];

  stats.forEach((stat, index) => {
    const x = cardX + index * (cardWidth + gap);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 5;

    drawRoundedRect(ctx, x, startY, cardWidth, cardHeight, 20);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fill();

    ctx.shadowColor = 'transparent';

    ctx.font = '40px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(stat.icon, x + cardWidth / 2, startY + 20);

    ctx.fillStyle = stat.color;
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.fillText(stat.value, x + cardWidth / 2, startY + 70);

    ctx.fillStyle = '#6B7280';
    ctx.font = '22px Arial, sans-serif';
    ctx.fillText(stat.label, x + cardWidth / 2, startY + 115);
  });
}

function drawGameMode(ctx: CanvasRenderingContext2D, gameMode: string) {
  const modeMap: Record<string, { name: string; color: string }> = {
    classic: { name: '经典模式', color: '#14B8A6' },
    practice: { name: '练习模式', color: '#3B82F6' },
    challenge: { name: '挑战模式', color: '#8B5CF6' },
  };

  const mode = modeMap[gameMode] || modeMap.classic;
  const centerX = CANVAS_WIDTH / 2;
  const y = 1070;

  drawRoundedRect(ctx, centerX - 80, y, 160, 50, 25);
  ctx.fillStyle = mode.color;
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(mode.name, centerX, y + 25);
}

function drawFooter(ctx: CanvasRenderingContext2D) {
  const centerX = CANVAS_WIDTH / 2;
  const y = 1180;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = '24px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('扫码下载APP，一起挑战每日单词！', centerX, y);

  const qrSize = 100;
  const qrX = centerX - qrSize / 2;
  const qrY = y + 40;

  drawRoundedRect(ctx, qrX, qrY, qrSize, qrSize, 12);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.fillText('QR Code', centerX, qrY + qrSize / 2 - 5);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '20px Arial, sans-serif';
  ctx.fillText('© 2024 每日单词拼图', centerX, 1280);
}

export async function generatePoster(data: PosterData): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('无法创建Canvas上下文'));
        return;
      }

      drawGradientBackground(ctx, data.isSuccess);
      drawLogo(ctx);
      drawResultBadge(ctx, data.isSuccess);
      drawWordCard(ctx, data);
      drawStats(ctx, data);
      drawGameMode(ctx, data.gameMode);
      drawFooter(ctx);

      const dataUrl = canvas.toDataURL('image/png', 0.95);
      resolve(dataUrl);
    } catch (error) {
      reject(error);
    }
  });
}

export async function downloadImage(dataUrl: string, filename: string = 'word-puzzle-poster.png'): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(resolve, 100);
    } catch (error) {
      reject(error);
    }
  });
}

export async function shareImage(dataUrl: string, text: string): Promise<boolean> {
  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], 'word-puzzle-poster.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: '每日单词拼图',
        text: text,
        files: [file],
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('分享失败:', error);
    return false;
  }
}

export type SaveMethod = 'download' | 'clipboard';

export interface SaveResult {
  success: boolean;
  method?: SaveMethod;
}

export async function saveToAlbum(dataUrl: string): Promise<SaveResult> {
  try {
    try {
      await downloadImage(dataUrl);
      return { success: true, method: 'download' };
    } catch (downloadError) {
      console.warn('下载失败，尝试复制到剪贴板:', downloadError);
      
      if (navigator.clipboard && window.ClipboardItem) {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
        return { success: true, method: 'clipboard' };
      }
      
      return { success: false };
    }
  } catch (error) {
    console.error('保存失败:', error);
    return { success: false };
  }
}
