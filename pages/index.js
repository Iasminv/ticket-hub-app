import { Geist, Geist_Mono } from "next/font/google";
import { useState, useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Sample concert data 
const CONCERTS = [
  { id: 1, title: "Forro Night", date: "May 15, 2025", price: 89.99, venue: "Downtown Arena" },
  { id: 2, title: "Rock Concert", date: "June 20, 2025", price: 65.50, venue: "Symphony Hall" },
  { id: 3, title: "Sertanejo Festival", date: "July 10, 2025", price: 75.00, venue: "Stadium Center" },
];

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedConcertId, setSelectedConcertId] = useState(10);
  const [formData, setFormData] = useState({
    concertId: 10,
    email: "",
    name: "",
    phone: "",
    quantity: 1,
    creditCard: "",
    expiration: "",
    securityCode: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    country: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [serverValidationErrors, setServerValidationErrors] = useState({});

  // Change background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % 3);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const backgroundImages = [
    "url('/img1.jpg')",
    "url('/img2.jpg')",
    "url('/img3.jpg')"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when field is updated
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleConcertSelect = (id) => {
    setSelectedConcertId(id);
    setFormData({
      ...formData,
      concertId: id,
    });
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Invalid email address";

    if (!formData.name) errors.name = "Name is required";
    else if (formData.name && formData.name.length > 200) errors.name = "Name must be less than 200 characters";

    if (!formData.phone) errors.phone = "Phone number is required";
    else if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(formData.phone)) errors.phone = "Invalid phone number";

    if (!formData.quantity || formData.quantity < 1) errors.quantity = "Quantity must be at least 1";

    if (!formData.creditCard) errors.creditCard = "Credit card number is required";
    else if (!/^[0-9]{13,19}$/.test(formData.creditCard.replace(/\D/g, ''))) errors.creditCard = "Invalid credit card number";

    if (!formData.expiration) errors.expiration = "Expiration date is required";
    else if (!/^(0[1-9]|1[0-2])(\/|-)?([0-9]{2}|[0-9]{4})$/.test(formData.expiration.trim()))
      errors.expiration = "Expiration must be in MM/YY or MM/YYYY format";

    if (!formData.securityCode) errors.securityCode = "Security code is required";
    else if (!/^[0-9]{3,4}$/.test(formData.securityCode))
      errors.securityCode = "3-4 digit security code required";

    if (!formData.address) errors.address = "Address is required";
    else if (formData.address && formData.address.length > 200) errors.address = "Address must be less than 200 characters";

    if (!formData.city) errors.city = "City is required";
    else if (formData.city && formData.city.length > 80) errors.city = "City must be less than 80 characters";

    if (!formData.province) errors.province = "Province is required";

    if (!formData.postalCode) errors.postalCode = "Postal code is required";

    if (!formData.country) errors.country = "Country is required";
    else if (formData.country && formData.country.length > 60) errors.country = "Country must be less than 60 characters";

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset submission states
    setSubmitSuccess(false);
    setSubmitError("");

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {

      const apiFormData = {
        ConcertId: formData.concertId,
        Email: formData.email,
        Name: formData.name,
        Phone: formData.phone,
        Quantity: formData.quantity,
        CreditCard: formData.creditCard,
        Expiration: formData.expiration,
        SecurityCode: formData.securityCode,
        Address: formData.address,
        City: formData.city,
        Province: formData.province,
        PostalCode: formData.postalCode,
        Country: formData.country,
      };

      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "cors",
          body: JSON.stringify(apiFormData),
        }
      );

      if (response.ok) {
        setSubmitSuccess(true);
        setServerValidationErrors({});
        // Reset form
        setFormData({
          concertId: selectedConcertId,
          email: "",
          name: "",
          phone: "",
          quantity: 1,
          creditCard: "",
          expiration: "",
          securityCode: "",
          address: "",
          city: "",
          province: "",
          postalCode: "",
          country: "",
        });
      } else {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        setSubmitError(errorData.title || "Failed to purchase ticket. Please try again.");

        // Display specific validation errors if available
        if (errorData.errors) {
          const serverErrors = {};
          Object.keys(errorData.errors).forEach(key => {
            serverErrors[key.toLowerCase()] = errorData.errors[key].join(', ');
          });
          setServerValidationErrors(serverErrors);
          setSubmitError("Please fix the validation errors below");
        } else {
          setSubmitError(errorData.title || "Failed to purchase ticket. Please try again.");
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} bg-neutral-100 min-h-screen font-[family-name:var(--font-geist-sans)]`}
    >
      {/* Header with background image */}
      <header
        className="relative h-150 bg-cover bg-top transition-all duration-1000 ease-in-out"
        style={{ backgroundImage: backgroundImages[currentImageIndex] }}
      >
        <div className="absolute inset-0 bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">TicketHub</h1>
            <p className="text-xl md:text-2xl">Get tickets for the hottest concerts</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Upcoming Concerts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CONCERTS.map((concert) => (
              <div
                key={concert.id}
                className={`border rounded-lg overflow-hidden shadow-md cursor-pointer transition-all hover:shadow-lg ${selectedConcertId === concert.id ? "ring-2 ring-blue-500" : ""
                  }`}
                onClick={() => handleConcertSelect(concert.id)}
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{concert.title}</h3>
                  <p className="text-gray-600 mb-1">{concert.date}</p>
                  <p className="text-gray-600 mb-1">{concert.venue}</p>
                  <p className="text-lg font-semibold mt-2">${concert.price.toFixed(2)}</p>
                  <div className="mt-4">
                    <button
                      className={`px-4 py-2 rounded-md w-full ${selectedConcertId === concert.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        }`}
                    >
                      {selectedConcertId === concert.id ? "Selected" : "Select"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6">Purchase Tickets</h2>
          {submitSuccess ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              <p className="font-bold">Success!</p>
              <p>Your tickets have been purchased. Check your email for confirmation.</p>
            </div>
          ) : null}

          {submitError ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <p className="font-bold">Error</p>
              <p>{submitError}</p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-neutral-50 p-4 rounded-md mb-6">
              <p className="font-semibold">
                Selected Concert: {CONCERTS.find(c => c.id === selectedConcertId)?.title}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Contact Information</h3>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${formErrors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      maxLength={200}
                  />
                  {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${formErrors.email ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${formErrors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Tickets
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${formErrors.quantity ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {formErrors.quantity && <p className="text-red-500 text-sm mt-1">{formErrors.quantity}</p>}
                </div>
              </div>

              {/* Payment Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Payment Information</h3>

                <div>
                  <label htmlFor="creditCard" className="block text-sm font-medium text-gray-700 mb-1">
                    Credit Card Number
                  </label>
                  <input
                    type="text"
                    id="creditCard"
                    name="creditCard"
                    value={formData.creditCard}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${formErrors.creditCard ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {formErrors.creditCard && <p className="text-red-500 text-sm mt-1">{formErrors.creditCard}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiration" className="block text-sm font-medium text-gray-700 mb-1">
                      Expiration (MM/YY)
                    </label>
                    <input
                      type="text"
                      id="expiration"
                      name="expiration"
                      placeholder="MM/YY"
                      value={formData.expiration}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${formErrors.expiration ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                    {formErrors.expiration && <p className="text-red-500 text-sm mt-1">{formErrors.expiration}</p>}
                  </div>

                  <div>
                    <label htmlFor="securityCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Security Code
                    </label>
                    <input
                      type="text"
                      id="securityCode"
                      name="securityCode"
                      value={formData.securityCode}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${formErrors.securityCode ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                    {formErrors.securityCode && <p className="text-red-500 text-sm mt-1">{formErrors.securityCode}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">Billing Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${formErrors.address ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    maxLength={80}
                    className={`w-full px-3 py-2 border rounded-md ${formErrors.city ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
                </div>

                <div>
                  <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                    Province/State
                  </label>
                  <input
                    type="text"
                    id="province"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${formErrors.province ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {formErrors.province && <p className="text-red-500 text-sm mt-1">{formErrors.province}</p>}
                </div>

                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${formErrors.postalCode ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {formErrors.postalCode && <p className="text-red-500 text-sm mt-1">{formErrors.postalCode}</p>}
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    maxLength={60}
                    className={`w-full px-3 py-2 border rounded-md ${formErrors.country ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {formErrors.country && <p className="text-red-500 text-sm mt-1">{formErrors.country}</p>}
                </div>
              </div>
            </div>

            {/* Total and submit button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-xl font-semibold">Total:</p>
                  <p className="text-gray-600">
                    {formData.quantity} x ${CONCERTS.find(c => c.id === selectedConcertId)?.price.toFixed(2)}
                  </p>
                </div>
                <p className="text-2xl font-bold">
                  ${(formData.quantity * (CONCERTS.find(c => c.id === selectedConcertId)?.price || 0)).toFixed(2)}
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-semibold text-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Purchase Tickets"}
              </button>
            </div>
          </form>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">TicketHub</h2>
              <p className="text-gray-400">Get tickets for the best concerts</p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">Contact</h3>
                <ul className="space-y-1 text-gray-400">
                  <li>info@tickethub.example.com</li>
                  <li>1-800-TICKETS</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Legal</h3>
                <ul className="space-y-1 text-gray-400">
                  <li>Terms of Service</li>
                  <li>Privacy Policy</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>© 2025 TicketHub. Iasmin Veronez.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}