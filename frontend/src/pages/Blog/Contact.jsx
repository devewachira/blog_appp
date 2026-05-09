import React, { useState } from "react";
import BlogLayout from "../../components/layouts/BlogLayout/BlogLayout";
import Input from "../../components/Inputs/Input";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { LuSend, LuLoaderCircle, LuMail, LuMapPin, LuPhone } from "react-icons/lu";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(API_PATHS.CONTACT.SUBMIT, formData);
      if (response.data) {
        toast.success("Thank you! Your message has been sent.");
        setFormData({ name: "", email: "", subject: "", message: "" });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BlogLayout>
      <div className="max-w-[1000px] mx-auto my-12 px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions about sustainable technology or want to collaborate with EcoTech Journal? 
            Send us a message and our team will get back to you as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Contact Information */}
          <div className="md:col-span-4 space-y-8">
            <div className="flex items-start gap-4">
              <div className="bg-sky-100 p-3 rounded-lg text-sky-600">
                <LuMail className="text-xl" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Email Us</h4>
                <p className="text-sm text-gray-600">mejoarwachira@gmail.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-teal-100 p-3 rounded-lg text-teal-600">
                <LuMapPin className="text-xl" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Our Office</h4>
                <p className="text-sm text-gray-600">123 Green Way, Eco City, Tech State 45678</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-cyan-100 p-3 rounded-lg text-cyan-600">
                <LuPhone className="text-xl" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Call Us</h4>
                <p className="text-sm text-gray-600">+1 (234) 567-890</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Your Name *"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  label="Email Address *"
                  placeholder="john@example.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <Input
                label="Subject"
                placeholder="How can we help?"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />

              <div>
                <label className="text-xs font-medium text-slate-600 mb-2 block">Message *</label>
                <textarea
                  className="w-full text-sm text-black bg-gray-50/50 rounded px-4 py-3 border border-gray-100 outline-none focus:border-sky-300 transition-all min-h-[150px]"
                  placeholder="Your message here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-all disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <LuLoaderCircle className="animate-spin text-lg" />
                ) : (
                  <LuSend className="text-lg" />
                )}
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </BlogLayout>
  );
};

export default Contact;
