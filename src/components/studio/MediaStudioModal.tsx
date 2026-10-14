import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  Upload,
  Play,
  Download,
  AlertCircle,
  RefreshCw,
  Film,
  Disc,
} from 'lucide-react';

interface MediaStudioModalProps {
  onClose: () => void;
}

export const MediaStudioModal: React.FC<MediaStudioModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'music'>('image');

  // Image Studio State
  const [imagePrompt, setImagePrompt] = useState('High-tech smart energy monitoring device PCB in clean university engineering lab, studio lighting');
  const [imageAspectRatio, setImageAspectRatio] = useState<'1:1' | '16:9' | '4:3'>('1:1');
  const [editImageFile, setEditImageFile] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>('/src/assets/images/hero_innovation_hub_1791965170305.jpg');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Video Studio State (Veo 3)
  const [videoPrompt, setVideoPrompt] = useState('Smooth cinematic flyover of a student robotics team testing autonomous rover on campus lawn');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoStartingImage, setVideoStartingImage] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>('https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
  const [isVideoProcessing, setIsVideoProcessing] = useState(false);

  // Music Studio State (Lyria 3)
  const [musicPrompt, setMusicPrompt] = useState('Energetic modern electronic soundtrack for a collegiate hackathon pitch demo, inspiring synth build');
  const [isFullLength, setIsFullLength] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>('https://actions.google.com/sounds/v1/science_fiction/scifi_pulse.ogg');
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);

  // Image Generation Handler
  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePrompt.trim()) return;

    setIsGeneratingImage(true);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          editImageBase64: editImageFile,
          aspectRatio: imageAspectRatio,
        }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
      }
    } catch (e) {
      console.warn('Image generation error:', e);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Video Generation Handler (Veo 3)
  const handleGenerateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoPrompt.trim()) return;

    setIsVideoProcessing(true);
    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          startingImageBase64: videoStartingImage,
          aspectRatio: videoAspectRatio,
        }),
      });
      const data = await res.json();
      if (data.videoUrl) {
        setGeneratedVideoUrl(data.videoUrl);
      }
    } catch (e) {
      console.warn('Video generation error:', e);
    } finally {
      setIsVideoProcessing(false);
    }
  };

  // Music Generation Handler (Lyria 3)
  const handleGenerateMusic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!musicPrompt.trim()) return;

    setIsGeneratingMusic(true);
    try {
      const res = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: musicPrompt,
          fullLength: isFullLength,
        }),
      });
      const data = await res.json();
      if (data.audioUrl) {
        setGeneratedAudioUrl(data.audioUrl);
      }
    } catch (e) {
      console.warn('Music generation error:', e);
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'edit' | 'videoStart') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        if (target === 'edit') setEditImageFile(base64);
        else setVideoStartingImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F1E36] border border-slate-750 rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl flex flex-col text-xs text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0F1E36] px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                Innovation Pitch Media Studio
              </h3>
              <span className="text-[11px] text-slate-400">
                Generate diagrams, pitch video teasers, and demo soundtracks
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 border border-slate-750 rounded-lg p-0.5">
              <button
                onClick={() => setActiveTab('image')}
                className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'image' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Images</span>
              </button>
              <button
                onClick={() => setActiveTab('video')}
                className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'video' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <VideoIcon className="w-3.5 h-3.5" />
                <span>Veo Video</span>
              </button>
              <button
                onClick={() => setActiveTab('music')}
                className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'music' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Lyria Music</span>
              </button>
            </div>

            <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white ml-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: IMAGE STUDIO */}
          {activeTab === 'image' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <form onSubmit={handleGenerateImage} className="md:col-span-6 space-y-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Image Creation / Editing Prompt (gemini-nano-banana-2.1)
                  </label>
                  <textarea
                    rows={3}
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Describe your innovation diagram, hardware prototype mockup, or user interface..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white text-xs focus:outline-none focus:border-cyan-400 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Aspect Ratio</label>
                    <select
                      value={imageAspectRatio}
                      onChange={(e) => setImageAspectRatio(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white text-xs"
                    >
                      <option value="1:1">1:1 Square</option>
                      <option value="16:9">16:9 Landscape</option>
                      <option value="4:3">4:3 Product</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Upload Photo to Edit</label>
                    <label className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-slate-300 hover:text-white cursor-pointer flex items-center justify-center gap-1.5 truncate">
                      <Upload className="w-3.5 h-3.5" />
                      <span className="truncate">{editImageFile ? 'Photo Loaded' : 'Select File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'edit')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isGeneratingImage}
                  className="w-full py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGeneratingImage ? 'Rendering Image...' : 'Generate / Edit Image'}</span>
                </button>
              </form>

              {/* Image Preview Canvas */}
              <div className="md:col-span-6 bg-slate-900 rounded-xl border border-slate-800 p-3 flex flex-col items-center justify-center">
                {generatedImageUrl ? (
                  <img
                    src={generatedImageUrl}
                    alt="Rendered illustration"
                    className="max-h-64 rounded-lg object-contain border border-slate-750"
                  />
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <span>No image generated yet.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: VEO 3 VIDEO STUDIO */}
          {activeTab === 'video' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <form onSubmit={handleGenerateVideo} className="md:col-span-6 space-y-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Veo 3 Video Prompt (veo-3.1-fast-generate-preview)
                  </label>
                  <textarea
                    rows={3}
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    placeholder="Describe motion, camera flyover, and university demonstration scene..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white text-xs focus:outline-none focus:border-cyan-400 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Video Aspect Ratio</label>
                    <select
                      value={videoAspectRatio}
                      onChange={(e) => setVideoAspectRatio(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white text-xs"
                    >
                      <option value="16:9">16:9 Landscape</option>
                      <option value="9:16">9:16 Portrait (Mobile)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Animate Photo</label>
                    <label className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-slate-300 hover:text-white cursor-pointer flex items-center justify-center gap-1.5 truncate">
                      <Film className="w-3.5 h-3.5" />
                      <span className="truncate">{videoStartingImage ? 'Start Frame' : 'Select Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'videoStart')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isVideoProcessing}
                  className="w-full py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Film className="w-4 h-4" />
                  <span>{isVideoProcessing ? 'Generating Veo Video...' : 'Generate Pitch Video'}</span>
                </button>
              </form>

              {/* Video Player */}
              <div className="md:col-span-6 bg-slate-900 rounded-xl border border-slate-800 p-3 flex flex-col items-center justify-center">
                {generatedVideoUrl ? (
                  <video
                    src={generatedVideoUrl}
                    controls
                    className="max-h-64 rounded-lg border border-slate-750 w-full"
                  />
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <VideoIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <span>No video generated yet.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: LYRIA 3 MUSIC STUDIO */}
          {activeTab === 'music' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <form onSubmit={handleGenerateMusic} className="md:col-span-6 space-y-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Soundtrack Prompt (lyria-3-clip-preview / lyria-3-pro-preview)
                  </label>
                  <textarea
                    rows={3}
                    value={musicPrompt}
                    onChange={(e) => setMusicPrompt(e.target.value)}
                    placeholder="Describe instruments, tempo, and mood for your pitch demonstration..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white text-xs focus:outline-none focus:border-cyan-400 leading-relaxed"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="fullLength"
                    checked={isFullLength}
                    onChange={(e) => setIsFullLength(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700"
                  />
                  <label htmlFor="fullLength" className="text-slate-300 font-medium cursor-pointer">
                    Full-Length Track (lyria-3-pro-preview) instead of 30s Clip
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isGeneratingMusic}
                  className="w-full py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Disc className="w-4 h-4" />
                  <span>{isGeneratingMusic ? 'Synthesizing Audio...' : 'Generate Pitch Audio'}</span>
                </button>
              </form>

              {/* Audio Player */}
              <div className="md:col-span-6 bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col items-center justify-center space-y-4">
                <Music className="w-10 h-10 text-cyan-400" />
                {generatedAudioUrl ? (
                  <audio src={generatedAudioUrl} controls className="w-full" />
                ) : (
                  <span className="text-slate-500">No soundtrack generated yet.</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
