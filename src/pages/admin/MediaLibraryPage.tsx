import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Image, Trash2, Search, Copy, Check, Grid, List, X, ExternalLink } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { MediaItem } from '../../types';
import PageHeader from '../../components/admin/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface MediaLibraryProps {
  onSelect?: (item: MediaItem) => void;
  selectable?: boolean;
}

export default function MediaLibrary({ onSelect, selectable = false }: MediaLibraryProps) {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      setMedia(data.data || []);
    } catch { addToast('Failed to load media', 'error'); }
    setLoading(false);
  };

  const optimizeImage = async (file: File): Promise<{ data: string; width: number; height: number }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxWidth = 1920;
          const maxHeight = 1080;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Convert to WebP if supported, otherwise keep original
          const isPng = file.type === 'image/png';
          const format = isPng ? 'image/png' : 'image/webp';
          const quality = isPng ? 1 : 0.8;

          const dataUrl = canvas.toDataURL(format, quality);
          resolve({ data: dataUrl, width, height });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (files: FileList | File[]) => {
    setUploading(true);
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/') && file.type !== 'application/pdf') {
        addToast(`${file.name}: Unsupported file type`, 'error');
        continue;
      }

      try {
        let uploadData: string;
        let optimized = false;

        // Optimize images client-side
        if (file.type.startsWith('image/') && file.size > 100000) {
          try {
            const result = await optimizeImage(file);
            uploadData = result.data.split(',')[1];
            optimized = true;
            addToast(`${file.name} optimized (${Math.round((1 - uploadData.length * 0.75 / file.size) * 100)}% smaller)`, 'info');
          } catch {
            // Fallback to original
            const buffer = await file.arrayBuffer();
            uploadData = btoa(String.fromCharCode(...new Uint8Array(buffer)));
          }
        } else {
          const buffer = await file.arrayBuffer();
          uploadData = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        }

        const res = await fetch('/api/media/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('cms_auth_token')}` },
          body: JSON.stringify({
            data: uploadData,
            filename: file.name,
            mime_type: file.type,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setMedia((prev) => [...prev, data.data]);
          addToast(`${file.name} uploaded`, 'success');
        } else {
          addToast(`Failed to upload ${file.name}`, 'error');
        }
      } catch {
        addToast(`Failed to upload ${file.name}`, 'error');
      }
    }
    setUploading(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) {
      handleUpload(e.dataTransfer.files);
    }
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file?')) return;
    try {
      await fetch(`/api/media/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('cms_auth_token')}` },
      });
      setMedia((prev) => prev.filter((m) => m.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
      addToast('File deleted', 'success');
    } catch { addToast('Failed to delete', 'error'); }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast('URL copied to clipboard', 'success');
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const filteredMedia = media.filter(
    (m) => m.filename.toLowerCase().includes(search.toLowerCase()) ||
      m.original_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.alt_text?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {!selectable && <PageHeader title="Media Library" />}

      {/* Upload area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center mb-8 transition-colors ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf"
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
          className="hidden"
        />
        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium mb-1">Drop files here or click to upload</p>
        <p className="text-xs text-gray-400 mb-3">Images are automatically optimized. Supports JPG, PNG, GIF, WebP, PDF, MP4</p>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Choose Files'}
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}>
            <Grid className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
        <span className="text-sm text-gray-500">{filteredMedia.length} files</span>
      </div>

      {loading ? <LoadingSpinner /> : filteredMedia.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No media files yet. Upload your first file above.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setSelectedItem(item);
                if (selectable && onSelect) onSelect(item);
              }}
              className={`group relative aspect-square rounded-xl border-2 overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                selectedItem?.id === item.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
              }`}
            >
              {item.mime_type.startsWith('image/') ? (
                <img src={item.url} alt={item.alt_text || item.filename} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-xs text-gray-500 uppercase">{item.mime_type.split('/')[1]}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); copyUrl(item.url); }}
                    className="p-2 bg-white rounded-lg text-gray-700 hover:text-blue-600"
                    title="Copy URL"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    className="p-2 bg-white rounded-lg text-gray-700 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              onClick={() => { setSelectedItem(item); if (selectable && onSelect) onSelect(item); }}
              className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer ${
                selectedItem?.id === item.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                {item.mime_type.startsWith('image/') ? (
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.original_name || item.filename}</p>
                <p className="text-xs text-gray-500">{formatSize(item.size)} · {item.mime_type}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={(e) => { e.stopPropagation(); copyUrl(item.url); }} className="p-2 text-gray-400 hover:text-blue-600" title="Copy URL">
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="p-2 text-gray-400 hover:text-red-600" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected item detail */}
      {selectedItem && !selectable && (
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start gap-6">
            <div className="w-40 h-40 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
              {selectedItem.mime_type.startsWith('image/') ? (
                <img src={selectedItem.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Image className="w-10 h-10 text-gray-400" /></div>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="font-semibold text-gray-900">{selectedItem.original_name || selectedItem.filename}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500">Size:</span> {formatSize(selectedItem.size)}</div>
                <div><span className="text-gray-500">Type:</span> {selectedItem.mime_type}</div>
                <div><span className="text-gray-500">Uploaded:</span> {new Date(selectedItem.created_at).toLocaleDateString()}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Alt Text</label>
                <input
                  type="text"
                  value={selectedItem.alt_text || ''}
                  onChange={async (e) => {
                    const newAlt = e.target.value;
                    setSelectedItem({ ...selectedItem, alt_text: newAlt });
                    await fetch(`/api/media/${selectedItem.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('cms_auth_token')}` },
                      body: JSON.stringify({ alt_text: newAlt }),
                    });
                  }}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Describe this image for accessibility..."
                />
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-gray-50 rounded text-xs text-gray-600 font-mono truncate">{selectedItem.url}</code>
                <button onClick={() => copyUrl(selectedItem.url)} className="p-2 text-gray-400 hover:text-blue-600">
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
