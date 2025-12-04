'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Upload, Download, Move, ZoomIn, Type, Calendar, Flag, RotateCcw } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import { clsx } from 'clsx';

// Country list for flag selection (simplified for demo, can be expanded)
// Full country list
const COUNTRIES = [
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫' },
  { code: 'AL', name: 'Albania', flag: '🇦🇱' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
  { code: 'AS', name: 'American Samoa', flag: '🇦🇸' },
  { code: 'AD', name: 'Andorra', flag: '🇦🇩' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴' },
  { code: 'AI', name: 'Anguilla', flag: '🇦🇮' },
  { code: 'AQ', name: 'Antarctica', flag: '🇦🇶' },
  { code: 'AG', name: 'Antigua and Barbuda', flag: '🇦🇬' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'AM', name: 'Armenia', flag: '🇦🇲' },
  { code: 'AW', name: 'Aruba', flag: '🇦🇼' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿' },
  { code: 'BS', name: 'Bahamas', flag: '🇧🇸' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'BB', name: 'Barbados', flag: '🇧🇧' },
  { code: 'BY', name: 'Belarus', flag: '🇧🇾' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'BZ', name: 'Belize', flag: '🇧🇿' },
  { code: 'BJ', name: 'Benin', flag: '🇧🇯' },
  { code: 'BM', name: 'Bermuda', flag: '🇧🇲' },
  { code: 'BT', name: 'Bhutan', flag: '🇧🇹' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { code: 'BW', name: 'Botswana', flag: '🇧🇼' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'IO', name: 'British Indian Ocean Territory', flag: '🇮🇴' },
  { code: 'BN', name: 'Brunei Darussalam', flag: '🇧🇳' },
  { code: 'BG', name: 'Bulgaria', flag: '�🇬' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: 'BI', name: 'Burundi', flag: '🇧�🇮' },
  { code: 'CV', name: 'Cabo Verde', flag: '🇨🇻' },
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭' },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲' },
  { code: 'CA', name: 'Canada', flag: '🇨â' },
  { code: 'KY', name: 'Cayman Islands', flag: '🇰🇾' },
  { code: 'CF', name: 'Central African Republic', flag: '🇨🇫' },
  { code: 'TD', name: 'Chad', flag: '🇹🇩' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'CX', name: 'Christmas Island', flag: '�🇽' },
  { code: 'CC', name: 'Cocos (Keeling) Islands', flag: '🇨🇨' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'KM', name: 'Comoros', flag: '🇰🇲' },
  { code: 'CD', name: 'Congo (DRC)', flag: '🇨�🇩' },
  { code: 'CG', name: 'Congo (Republic)', flag: '🇨🇬' },
  { code: 'CK', name: 'Cook Islands', flag: '🇨🇰' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺' },
  { code: 'CW', name: 'Curaçao', flag: '🇨🇼' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'DJ', name: 'Djibouti', flag: '🇩🇯' },
  { code: 'DM', name: 'Dominica', flag: '🇩🇲' },
  { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶' },
  { code: 'ER', name: 'Eritrea', flag: '🇪🇷' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪' },
  { code: 'SZ', name: 'Eswatini', flag: '🇸🇿' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
  { code: 'FK', name: 'Falkland Islands', flag: '🇫🇰' },
  { code: 'FO', name: 'Faroe Islands', flag: '🇫�' },
  { code: 'FJ', name: 'Fiji', flag: '🇫🇯' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'GF', name: 'French Guiana', flag: '🇬🇫' },
  { code: 'PF', name: 'French Polynesia', flag: '🇵🇫' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦' },
  { code: 'GM', name: 'Gambia', flag: '🇬🇲' },
  { code: 'GE', name: 'Georgia', flag: '🇬🇪' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'GI', name: 'Gibraltar', flag: '🇬🇮' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'GL', name: 'Greenland', flag: '🇬🇱' },
  { code: 'GD', name: 'Grenada', flag: '🇬🇩' },
  { code: 'GP', name: 'Guadeloupe', flag: '🇬🇵' },
  { code: 'GU', name: 'Guam', flag: '🇬�🇺' },
  { code: 'GT', name: 'Guatemala', flag: '�🇹' },
  { code: 'GG', name: 'Guernsey', flag: '🇬🇬' },
  { code: 'GN', name: 'Guinea', flag: '🇬🇳' },
  { code: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: 'GY', name: 'Guyana', flag: '🇬🇾' },
  { code: 'HT', name: 'Haiti', flag: '🇭🇹' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'IR', name: 'Iran', flag: '🇮🇷' },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'IM', name: 'Isle of Man', flag: '��' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'JM', name: 'Jamaica', flag: '��' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'JE', name: 'Jersey', flag: '🇯🇪' },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴' },
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'KI', name: 'Kiribati', flag: '�🇮' },
  { code: 'KP', name: 'North Korea', flag: '🇰�🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'KG', name: 'Kyrgyzstan', flag: '🇰🇬' },
  { code: 'LA', name: 'Laos', flag: '🇱🇦' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻' },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧' },
  { code: 'LS', name: 'Lesotho', flag: '�🇸' },
  { code: 'LR', name: 'Liberia', flag: '🇱�🇷' },
  { code: 'LY', name: 'Libya', flag: '🇱🇾' },
  { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'MO', name: 'Macao', flag: '🇲🇴' },
  { code: 'MG', name: 'Madagascar', flag: '🇲🇬' },
  { code: 'MW', name: 'Malawi', flag: '🇲🇼' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'MV', name: 'Maldives', flag: '🇲🇻' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹' },
  { code: 'MH', name: 'Marshall Islands', flag: '🇲🇭' },
  { code: 'MQ', name: 'Martinique', flag: '🇲🇶' },
  { code: 'MR', name: 'Mauritania', flag: '🇲🇷' },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺' },
  { code: 'YT', name: 'Mayotte', flag: '🇾🇹' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'FM', name: 'Micronesia', flag: '🇫🇲' },
  { code: 'MD', name: 'Moldova', flag: '🇲🇩' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨' },
  { code: 'MN', name: 'Mongolia', flag: '🇲🇳' },
  { code: 'ME', name: 'Montenegro', flag: '🇲🇪' },
  { code: 'MS', name: 'Montserrat', flag: '🇲🇸' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿' },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲' },
  { code: 'NA', name: 'Namibia', flag: '🇳🇦' },
  { code: 'NR', name: 'Nauru', flag: '🇳🇷' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'NC', name: 'New Caledonia', flag: '🇳🇨' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
  { code: 'NE', name: 'Niger', flag: '🇳🇪' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'NU', name: 'Niue', flag: '🇳🇺' },
  { code: 'NF', name: 'Norfolk Island', flag: '🇳🇫' },
  { code: 'MK', name: 'North Macedonia', flag: '🇲🇰' },
  { code: 'MP', name: 'Northern Mariana Islands', flag: '🇲�' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'PW', name: 'Palau', flag: '🇵🇼' },
  { code: 'PS', name: 'Palestine', flag: '🇵🇸' },
  { code: 'PA', name: 'Panama', flag: '🇵🇦' },
  { code: 'PG', name: 'Papua New Guinea', flag: '🇵🇬' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'PN', name: 'Pitcairn', flag: '🇵🇳' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'PR', name: 'Puerto Rico', flag: '🇵🇷' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: 'RE', name: 'Réunion', flag: '🇷🇪' },
  { code: 'RO', name: 'Romania', flag: '�🇴' },
  { code: 'RU', name: 'Russia', flag: '🇷�🇺' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼' },
  { code: 'BL', name: 'Saint Barthélemy', flag: '🇧🇱' },
  { code: 'SH', name: 'Saint Helena', flag: '🇸🇭' },
  { code: 'KN', name: 'Saint Kitts and Nevis', flag: '🇰🇳' },
  { code: 'LC', name: 'Saint Lucia', flag: '🇱🇨' },
  { code: 'MF', name: 'Saint Martin', flag: '🇲🇫' },
  { code: 'PM', name: 'Saint Pierre and Miquelon', flag: '🇵🇲' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines', flag: '��🇨' },
  { code: 'WS', name: 'Samoa', flag: '�🇸' },
  { code: 'SM', name: 'San Marino', flag: '🇸🇲' },
  { code: 'ST', name: 'Sao Tome and Principe', flag: '🇸🇹' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸�🇦' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳' },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸' },
  { code: 'SC', name: 'Seychelles', flag: '🇸🇨' },
  { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'SX', name: 'Sint Maarten', flag: '��' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮' },
  { code: 'SB', name: 'Solomon Islands', flag: '🇸🇧' },
  { code: 'SO', name: 'Somalia', flag: '🇸🇴' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'SS', name: 'South Sudan', flag: '��' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'SD', name: 'Sudan', flag: '🇸🇩' },
  { code: 'SR', name: 'Suriname', flag: '🇸🇷' },
  { code: 'SJ', name: 'Svalbard and Jan Mayen', flag: '🇸🇯' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'SY', name: 'Syria', flag: '🇸🇾' },
  { code: 'TW', name: 'Taiwan', flag: '��' },
  { code: 'TJ', name: 'Tajikistan', flag: '🇹🇯' },
  { code: 'TZ', name: 'Tanzania', flag: '��' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'TL', name: 'Timor-Leste', flag: '🇹🇱' },
  { code: 'TG', name: 'Togo', flag: '🇹🇬' },
  { code: 'TK', name: 'Tokelau', flag: '🇹🇰' },
  { code: 'TO', name: 'Tonga', flag: '🇹🇴' },
  { code: 'TT', name: 'Trinidad and Tobago', flag: '🇹🇹' },
  { code: 'TN', name: 'Tunisia', flag: '�🇳' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'TM', name: 'Turkmenistan', flag: '🇹🇲' },
  { code: 'TC', name: 'Turks and Caicos Islands', flag: '🇹🇨' },
  { code: 'TV', name: 'Tuvalu', flag: '🇹🇻' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'AE', name: 'United Arab Emirates', flag: '��' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'UY', name: 'Uruguay', flag: '🇺�' },
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿' },
  { code: 'VU', name: 'Vanuatu', flag: '🇻🇺' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'WF', name: 'Wallis and Futuna', flag: '🇼🇫' },
  { code: 'EH', name: 'Western Sahara', flag: '�🇭' },
  { code: 'YE', name: 'Yemen', flag: '🇾🇪' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲' },
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼' },
];

export function PhotoFrameGenerator() {
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState('Tumpak Sewu Waterfall');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  
  // Date state
  const [selectedMonth, setSelectedMonth] = useState('August');
  const [selectedYear, setSelectedYear] = useState('2023');
  
  // Country Search State
  const [countryQuery, setCountryQuery] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  
  // Image manipulation state
  const [zoom, setZoom] = useState(1);
  const [baseScale, setBaseScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const filteredCountries = COUNTRIES.filter(country => 
    country.name.toLowerCase().includes(countryQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setImage(url);
    }
  };

  const handleDownload = async (format: 'png' | 'jpg') => {
    if (!frameRef.current) return;
    
    try {
      // Small delay to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 100));

      const options = {
        cacheBust: true,
        pixelRatio: 2,
        quality: format === 'jpg' ? 0.95 : undefined,
        backgroundColor: 'transparent', // Ensure transparency for PNG if needed, though frame is white
      };

      const dataUrl = format === 'png' 
        ? await toPng(frameRef.current, options)
        : await toJpeg(frameRef.current, options);
        
      const link = document.createElement('a');
      link.download = `photo-frame-${Date.now()}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image', err);
      alert('Failed to generate image. Please try again.');
    }
  };

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Controls */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Image Upload */}
        <div className="neu-flat p-6 rounded-3xl">
          <h3 className="text-lg font-bold mb-4 text-gray-700 dark:text-white flex items-center gap-2">
            <Upload size={20} />
            Upload Photo
          </h3>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-3 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400"><span className="font-bold">Click to upload</span> or drag and drop</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
        </div>

        {/* Text Inputs */}
        <div className="neu-flat p-6 rounded-3xl space-y-4">
          <h3 className="text-lg font-bold mb-2 text-gray-700 dark:text-white flex items-center gap-2">
            <Type size={20} />
            Details
          </h3>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl neu-pressed text-gray-700 dark:text-white outline-none bg-transparent"
              placeholder="e.g. Tumpak Sewu Waterfall"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Date</label>
            <div className="flex gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl neu-pressed text-gray-700 dark:text-white outline-none bg-transparent appearance-none"
              >
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl neu-pressed text-gray-700 dark:text-white outline-none bg-transparent appearance-none"
              >
                {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative" ref={countryDropdownRef}>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Country Flag</label>
            <div 
              className="w-full px-4 py-3 rounded-xl neu-pressed text-gray-700 dark:text-white bg-transparent flex items-center justify-between cursor-pointer"
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedCountry.flag}</span>
                <span>{selectedCountry.name}</span>
              </div>
              <span className="text-xs">▼</span>
            </div>

            {showCountryDropdown && (
              <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl max-h-60 overflow-y-auto border border-gray-100 dark:border-gray-700">
                <div className="p-2 sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                  <input
                    type="text"
                    placeholder="Search country..."
                    className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 outline-none text-sm"
                    value={countryQuery}
                    onChange={(e) => setCountryQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                </div>
                {filteredCountries.map(country => (
                  <div
                    key={country.code}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3"
                    onClick={() => {
                      setSelectedCountry(country);
                      setShowCountryDropdown(false);
                      setCountryQuery('');
                    }}
                  >
                    <span className="text-xl">{country.flag}</span>
                    <span>{country.name}</span>
                  </div>
                ))}
                {filteredCountries.length === 0 && (
                  <div className="px-4 py-3 text-gray-500 text-center text-sm">No countries found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Image Controls */}
        {image && (
          <div className="neu-flat p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-700 dark:text-white flex items-center gap-2">
                <Move size={20} />
                Adjust Image
              </h3>
              <button 
                onClick={() => { setZoom(1); setPosition(initialPosition); }}
                className="text-xs text-blue-500 font-bold flex items-center gap-1 hover:text-blue-600"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
                <span>Zoom</span>
                <span className="text-xs text-gray-500">{Math.round(zoom * 100)}%</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Preview */}
      <div className="lg:col-span-8">
        <div className="sticky top-24 space-y-6">
          <div className="glass-panel p-8 flex items-center justify-center bg-gray-100/50 dark:bg-gray-900/50 min-h-[600px]">
            
            {/* Polaroid Frame */}
            <div 
              ref={frameRef}
              className="bg-white shadow-2xl relative flex flex-col items-center"
              style={{
                width: '420px', // 14 units * 30px scale
                height: '510px', // 17 units * 30px scale
                padding: '30px 30px 120px 30px', // 1 unit top/sides, 4 units bottom
                boxSizing: 'border-box'
              }}
            >
              {/* Image Area */}
              <div 
                className="w-full h-full bg-gray-100 overflow-hidden relative cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {image ? (
                  <img
                    ref={imageRef}
                    src={image}
                    alt="Uploaded"
                    className="absolute max-w-none"
                    onLoad={(e) => {
                      const { naturalWidth, naturalHeight } = e.currentTarget;
                      const CONTAINER_SIZE = 360;
                      
                      // Calculate scale to cover the container
                      const scaleX = CONTAINER_SIZE / naturalWidth;
                      const scaleY = CONTAINER_SIZE / naturalHeight;
                      const scale = Math.max(scaleX, scaleY);
                      
                      setBaseScale(scale);
                      setZoom(1);
                      
                      // Center the image
                      const x = (CONTAINER_SIZE - naturalWidth) / 2;
                      const y = (CONTAINER_SIZE - naturalHeight) / 2;
                      
                      setPosition({ x, y });
                      setInitialPosition({ x, y });
                    }}
                    style={{
                      transform: `translate(${position.x}px, ${position.y}px) scale(${baseScale * zoom})`,
                      transformOrigin: 'center',
                      pointerEvents: 'none', // Let the container handle events
                      userSelect: 'none',
                      left: 0,
                      top: 0,
                    }}
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <p className="text-sm font-medium">Upload an image</p>
                  </div>
                )}
              </div>

              {/* Text Area (Absolute positioned relative to frame) */}
              <div className="absolute bottom-0 left-0 w-full h-[120px] px-[30px] py-4 flex flex-col justify-center">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-1">
                    <h2 
                      className="text-2xl text-gray-800 leading-tight"
                      style={{ fontFamily: 'var(--font-recursive), sans-serif', fontWeight: 600 }}
                    >
                      {title}
                    </h2>
                    <p 
                      className="text-lg text-gray-600"
                      style={{ fontFamily: 'var(--font-recursive), sans-serif', fontWeight: 400 }}
                    >
                      {selectedMonth} {selectedYear}
                    </p>
                  </div>
                  <div className="text-4xl filter drop-shadow-sm">
                    {selectedCountry.flag}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Download Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => handleDownload('png')}
              className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Download PNG
            </button>
            <button
              onClick={() => handleDownload('jpg')}
              className="flex-1 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Download JPG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
