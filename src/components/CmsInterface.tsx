import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Content } from '../types';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEllipsisV } from 'react-icons/fa';

const CmsInterface = () => {
  const [contentList, setContentList] = useState<Content[]>([]);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const fetchContent = async () => {
    console.log(import.meta.env.VITE_BACKEND_URL)
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/cms/content`);
      setContentList(response.data);
    } catch (error) {
      toast.error('Failed to fetch content');
    } finally {
      setLoading(false);
    }
  };

  const addContent = async () => {
    if (!title.trim() || !text.trim()) {
      toast.warning('Please fill in both title and text');
      return;
    }

    setLoading(true);
    try {
      if (editMode && selectedContent) {
        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/cms/content/${selectedContent.id}`, {
          title,
          text,
        });
        toast.success('Content updated successfully');
      } else {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/cms/content`, { title, text });
        toast.success('Content added successfully');
      }
      fetchContent();
      resetForm();
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const deleteContent = async (id: number) => {
    setLoading(true);
    try {
      await axios.delete(`${import.meta .env.VITE_BACKEND_URL}/api/cms/content/${id}`);
      toast.success('Content deleted');
      fetchContent();
    } catch (error) {
      toast.error('Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  const editContent = (content: Content) => {
    setEditMode(true);
    setSelectedContent(content);
    setTitle(content.title);
    setText(content.text);
    setShowModal(true);
  };

  const resetForm = () => {
    setTitle('');
    setText('');
    setEditMode(false);
    setSelectedContent(null);
    setShowModal(false);
    setPreviewId(null);
    setOpenDropdownId(null);
  };

  const togglePreview = (id: number) => {
    setPreviewId(previewId === id ? null : id);
  };

  const toggleDropdown = (id: number) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showModal]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };

    if (openDropdownId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-lg min-h-screen relative md:p-8">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0 mr-4">Manage ChatBot Content</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="text-black px-4 py-2 rounded-full bg-amber-100 transition duration-200"
        >
          <svg className="w-5 h-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="hidden md:inline">New Content</span>
        </button>
      </div>

      {loading && (
        <div className="text-center py-4 text-indigo-600 font-medium animate-pulse">
          Loading...
        </div>
      )}

      <div className="space-y-4 overflow-y-auto pr-2 md:pr-3 pb-30">
        {contentList.length === 0 && !loading ? (
          <p className="text-gray-600 italic">No chatbot content available yet. Click "+ New" to add some.</p>
        ) : (
          contentList.map((content) => (
            <div key={content.id} className="border rounded-lg bg-gray-100 shadow-sm hover:shadow-md transition duration-200 relative">
              <div className="p-4 md:p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{content.title}</h3>
                    {previewId === content.id && (
                      <div className="mt-2 p-3 rounded-md bg-gray-100 text-gray-700 whitespace-pre-line">
                        {content.text}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(content.id)}
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      <FaEllipsisV className="h-4 w-4" />
                    </button>
                    {openDropdownId === content.id && (
                      <div
                        ref={dropdownRef}
                        className="absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white z-10 "
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="options-menu-button"
                      >
                        <div className="py-1" role="none">
                          <button
                            onClick={() => {
                              editContent(content);
                              setOpenDropdownId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-black"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              togglePreview(content.id);
                              setOpenDropdownId(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900"
                            role="menuitem"
                          >
                            {previewId === content.id ? 'Hide Preview' : 'Preview'}
                          </button>
                          <button
                            onClick={() => {
                              deleteContent(content.id);
                              setOpenDropdownId(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 focus:bg-gray-100 focus:text-red-700"
                            role="menuitem"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Content Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white w-11/12 md:max-w-md rounded-xl p-4 md:p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-3 text-gray-800 md:text-2xl md:mb-4">
              {editMode ? 'Edit Content' : 'Add New Content'}
            </h3>

            <div className="mb-2 md:mb-3">
              <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
              />
            </div>

            <div className="mb-3 md:mb-4">
              <label htmlFor="text" className="block text-gray-700 text-sm font-bold mb-1">
                Response Text
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter response text"
                rows={4}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
              />
            </div>

            <div className="flex flex-col-reverse md:flex-row justify-end items-center space-y-2 md:space-y-0 md:space-x-3">
              <button
                onClick={resetForm}
                className="bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-200 text-sm w-full md:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={addContent}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition duration-200 text-sm w-full md:w-auto"
              >
                {editMode ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CmsInterface;