import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface CountryOption {
  value: string;
  label: string;
  flag?: string;
}

interface CountryDropdownProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  error?: boolean;
}

const countries: CountryOption[] = [
  { value: 'AF', label: 'Afghanistan', flag: '🇦🇫' },
  { value: 'AL', label: 'Albania', flag: '🇦🇱' },
  { value: 'DZ', label: 'Algeria', flag: '🇩🇿' },
  { value: 'AS', label: 'American Samoa', flag: '🇦🇸' },
  { value: 'AD', label: 'Andorra', flag: '🇦🇩' },
  { value: 'AO', label: 'Angola', flag: '🇦🇴' },
  { value: 'AI', label: 'Anguilla', flag: '🇦🇮' },
  { value: 'AQ', label: 'Antarctica', flag: '🇦🇶' },
  { value: 'AG', label: 'Antigua and Barbuda', flag: '🇦🇬' },
  { value: 'AR', label: 'Argentina', flag: '🇦🇷' },
  { value: 'AM', label: 'Armenia', flag: '🇦🇲' },
  { value: 'AW', label: 'Aruba', flag: '🇦🇼' },
  { value: 'AU', label: 'Australia', flag: '🇦🇺' },
  { value: 'AT', label: 'Austria', flag: '🇦🇹' },
  { value: 'AZ', label: 'Azerbaijan', flag: '🇦🇿' },
  { value: 'BS', label: 'Bahamas', flag: '🇧🇸' },
  { value: 'BH', label: 'Bahrain', flag: '🇧🇭' },
  { value: 'BD', label: 'Bangladesh', flag: '🇧🇩' },
  { value: 'BB', label: 'Barbados', flag: '🇧🇧' },
  { value: 'BY', label: 'Belarus', flag: '🇧🇾' },
  { value: 'BE', label: 'Belgium', flag: '🇧🇪' },
  { value: 'BZ', label: 'Belize', flag: '🇧🇿' },
  { value: 'BJ', label: 'Benin', flag: '🇧🇯' },
  { value: 'BM', label: 'Bermuda', flag: '🇧🇲' },
  { value: 'BT', label: 'Bhutan', flag: '🇧🇹' },
  { value: 'BO', label: 'Bolivia', flag: '🇧🇴' },
  { value: 'BA', label: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { value: 'BW', label: 'Botswana', flag: '🇧🇼' },
  { value: 'BR', label: 'Brazil', flag: '🇧🇷' },
  { value: 'IO', label: 'British Indian Ocean Territory', flag: '🇮🇴' },
  { value: 'BN', label: 'Brunei', flag: '🇧🇳' },
  { value: 'BG', label: 'Bulgaria', flag: '🇧🇬' },
  { value: 'BF', label: 'Burkina Faso', flag: '🇧🇫' },
  { value: 'BI', label: 'Burundi', flag: '🇧🇮' },
  { value: 'CV', label: 'Cabo Verde', flag: '🇨🇻' },
  { value: 'KH', label: 'Cambodia', flag: '🇰🇭' },
  { value: 'CM', label: 'Cameroon', flag: '🇨🇲' },
  { value: 'CA', label: 'Canada', flag: '🇨🇦' },
  { value: 'KY', label: 'Cayman Islands', flag: '🇰🇾' },
  { value: 'CF', label: 'Central African Republic', flag: '🇨🇫' },
  { value: 'TD', label: 'Chad', flag: '🇹🇩' },
  { value: 'CL', label: 'Chile', flag: '🇨🇱' },
  { value: 'CN', label: 'China', flag: '🇨🇳' },
  { value: 'CX', label: 'Christmas Island', flag: '🇨🇽' },
  { value: 'CC', label: 'Cocos Islands', flag: '🇨🇨' },
  { value: 'CO', label: 'Colombia', flag: '🇨🇴' },
  { value: 'KM', label: 'Comoros', flag: '🇰🇲' },
  { value: 'CG', label: 'Congo', flag: '🇨🇬' },
  { value: 'CD', label: 'Congo (Democratic Republic)', flag: '🇨🇩' },
  { value: 'CK', label: 'Cook Islands', flag: '🇨🇰' },
  { value: 'CR', label: 'Costa Rica', flag: '🇨🇷' },
  { value: 'CI', label: 'Côte d\'Ivoire', flag: '🇨🇮' },
  { value: 'HR', label: 'Croatia', flag: '🇭🇷' },
  { value: 'CU', label: 'Cuba', flag: '🇨🇺' },
  { value: 'CW', label: 'Curaçao', flag: '🇨🇼' },
  { value: 'CY', label: 'Cyprus', flag: '🇨🇾' },
  { value: 'CZ', label: 'Czech Republic', flag: '🇨🇿' },
  { value: 'DK', label: 'Denmark', flag: '🇩🇰' },
  { value: 'DJ', label: 'Djibouti', flag: '🇩🇯' },
  { value: 'DM', label: 'Dominica', flag: '🇩🇲' },
  { value: 'DO', label: 'Dominican Republic', flag: '🇩🇴' },
  { value: 'EC', label: 'Ecuador', flag: '🇪🇨' },
  { value: 'EG', label: 'Egypt', flag: '🇪🇬' },
  { value: 'SV', label: 'El Salvador', flag: '🇸🇻' },
  { value: 'GQ', label: 'Equatorial Guinea', flag: '🇬🇶' },
  { value: 'ER', label: 'Eritrea', flag: '🇪🇷' },
  { value: 'EE', label: 'Estonia', flag: '🇪🇪' },
  { value: 'SZ', label: 'Eswatini', flag: '🇸🇿' },
  { value: 'ET', label: 'Ethiopia', flag: '🇪🇹' },
  { value: 'FK', label: 'Falkland Islands', flag: '🇫🇰' },
  { value: 'FO', label: 'Faroe Islands', flag: '🇫🇴' },
  { value: 'FJ', label: 'Fiji', flag: '🇫🇯' },
  { value: 'FI', label: 'Finland', flag: '🇫🇮' },
  { value: 'FR', label: 'France', flag: '🇫🇷' },
  { value: 'GF', label: 'French Guiana', flag: '🇬🇫' },
  { value: 'PF', label: 'French Polynesia', flag: '🇵🇫' },
  { value: 'GA', label: 'Gabon', flag: '🇬🇦' },
  { value: 'GM', label: 'Gambia', flag: '🇬🇲' },
  { value: 'GE', label: 'Georgia', flag: '🇬🇪' },
  { value: 'DE', label: 'Germany', flag: '🇩🇪' },
  { value: 'GH', label: 'Ghana', flag: '🇬🇭' },
  { value: 'GI', label: 'Gibraltar', flag: '🇬🇮' },
  { value: 'GR', label: 'Greece', flag: '🇬🇷' },
  { value: 'GL', label: 'Greenland', flag: '🇬🇱' },
  { value: 'GD', label: 'Grenada', flag: '🇬🇩' },
  { value: 'GP', label: 'Guadeloupe', flag: '🇬🇵' },
  { value: 'GU', label: 'Guam', flag: '🇬🇺' },
  { value: 'GT', label: 'Guatemala', flag: '🇬🇹' },
  { value: 'GG', label: 'Guernsey', flag: '🇬🇬' },
  { value: 'GN', label: 'Guinea', flag: '🇬🇳' },
  { value: 'GW', label: 'Guinea-Bissau', flag: '🇬🇼' },
  { value: 'GY', label: 'Guyana', flag: '🇬🇾' },
  { value: 'HT', label: 'Haiti', flag: '🇭🇹' },
  { value: 'VA', label: 'Holy See', flag: '🇻🇦' },
  { value: 'HN', label: 'Honduras', flag: '🇭🇳' },
  { value: 'HK', label: 'Hong Kong', flag: '🇭🇰' },
  { value: 'HU', label: 'Hungary', flag: '🇭🇺' },
  { value: 'IS', label: 'Iceland', flag: '🇮🇸' },
  { value: 'IN', label: 'India', flag: '🇮🇳' },
  { value: 'ID', label: 'Indonesia', flag: '🇮🇩' },
  { value: 'IR', label: 'Iran', flag: '🇮🇷' },
  { value: 'IQ', label: 'Iraq', flag: '🇮🇶' },
  { value: 'IE', label: 'Ireland', flag: '🇮🇪' },
  { value: 'IM', label: 'Isle of Man', flag: '🇮🇲' },
  { value: 'IL', label: 'Israel', flag: '🇮🇱' },
  { value: 'IT', label: 'Italy', flag: '🇮🇹' },
  { value: 'JM', label: 'Jamaica', flag: '🇯🇲' },
  { value: 'JP', label: 'Japan', flag: '🇯🇵' },
  { value: 'JE', label: 'Jersey', flag: '🇯🇪' },
  { value: 'JO', label: 'Jordan', flag: '🇯🇴' },
  { value: 'KZ', label: 'Kazakhstan', flag: '🇰🇿' },
  { value: 'KE', label: 'Kenya', flag: '🇰🇪' },
  { value: 'KI', label: 'Kiribati', flag: '🇰🇮' },
  { value: 'KP', label: 'Korea (North)', flag: '🇰🇵' },
  { value: 'KR', label: 'Korea (South)', flag: '🇰🇷' },
  { value: 'KW', label: 'Kuwait', flag: '🇰🇼' },
  { value: 'KG', label: 'Kyrgyzstan', flag: '🇰🇬' },
  { value: 'LA', label: 'Laos', flag: '🇱🇦' },
  { value: 'LV', label: 'Latvia', flag: '🇱🇻' },
  { value: 'LB', label: 'Lebanon', flag: '🇱🇧' },
  { value: 'LS', label: 'Lesotho', flag: '🇱🇸' },
  { value: 'LR', label: 'Liberia', flag: '🇱🇷' },
  { value: 'LY', label: 'Libya', flag: '🇱🇾' },
  { value: 'LI', label: 'Liechtenstein', flag: '🇱🇮' },
  { value: 'LT', label: 'Lithuania', flag: '🇱🇹' },
  { value: 'LU', label: 'Luxembourg', flag: '🇱🇺' },
  { value: 'MO', label: 'Macao', flag: '🇲🇴' },
  { value: 'MK', label: 'Macedonia', flag: '🇲🇰' },
  { value: 'MG', label: 'Madagascar', flag: '🇲🇬' },
  { value: 'MW', label: 'Malawi', flag: '🇲🇼' },
  { value: 'MY', label: 'Malaysia', flag: '🇲🇾' },
  { value: 'MV', label: 'Maldives', flag: '🇲🇻' },
  { value: 'ML', label: 'Mali', flag: '🇲🇱' },
  { value: 'MT', label: 'Malta', flag: '🇲🇹' },
  { value: 'MH', label: 'Marshall Islands', flag: '🇲🇭' },
  { value: 'MQ', label: 'Martinique', flag: '🇲🇶' },
  { value: 'MR', label: 'Mauritania', flag: '🇲🇷' },
  { value: 'MU', label: 'Mauritius', flag: '🇲🇺' },
  { value: 'YT', label: 'Mayotte', flag: '🇾🇹' },
  { value: 'MX', label: 'Mexico', flag: '🇲🇽' },
  { value: 'FM', label: 'Micronesia', flag: '🇫🇲' },
  { value: 'MD', label: 'Moldova', flag: '🇲🇩' },
  { value: 'MC', label: 'Monaco', flag: '🇲🇨' },
  { value: 'MN', label: 'Mongolia', flag: '🇲🇳' },
  { value: 'ME', label: 'Montenegro', flag: '🇲🇪' },
  { value: 'MS', label: 'Montserrat', flag: '🇲🇸' },
  { value: 'MA', label: 'Morocco', flag: '🇲🇦' },
  { value: 'MZ', label: 'Mozambique', flag: '🇲🇿' },
  { value: 'MM', label: 'Myanmar', flag: '🇲🇲' },
  { value: 'NA', label: 'Namibia', flag: '🇳🇦' },
  { value: 'NR', label: 'Nauru', flag: '🇳🇷' },
  { value: 'NP', label: 'Nepal', flag: '🇳🇵' },
  { value: 'NL', label: 'Netherlands', flag: '🇳🇱' },
  { value: 'NC', label: 'New Caledonia', flag: '🇳🇨' },
  { value: 'NZ', label: 'New Zealand', flag: '🇳🇿' },
  { value: 'NI', label: 'Nicaragua', flag: '🇳🇮' },
  { value: 'NE', label: 'Niger', flag: '🇳🇪' },
  { value: 'NG', label: 'Nigeria', flag: '🇳🇬' },
  { value: 'NU', label: 'Niue', flag: '🇳🇺' },
  { value: 'NF', label: 'Norfolk Island', flag: '🇳🇫' },
  { value: 'MP', label: 'Northern Mariana Islands', flag: '🇲🇵' },
  { value: 'NO', label: 'Norway', flag: '🇳🇴' },
  { value: 'OM', label: 'Oman', flag: '🇴🇲' },
  { value: 'PK', label: 'Pakistan', flag: '🇵🇰' },
  { value: 'PW', label: 'Palau', flag: '🇵🇼' },
  { value: 'PS', label: 'Palestine', flag: '🇵🇸' },
  { value: 'PA', label: 'Panama', flag: '🇵🇦' },
  { value: 'PG', label: 'Papua New Guinea', flag: '🇵🇬' },
  { value: 'PY', label: 'Paraguay', flag: '🇵🇾' },
  { value: 'PE', label: 'Peru', flag: '🇵🇪' },
  { value: 'PH', label: 'Philippines', flag: '🇵🇭' },
  { value: 'PN', label: 'Pitcairn', flag: '🇵🇳' },
  { value: 'PL', label: 'Poland', flag: '🇵🇱' },
  { value: 'PT', label: 'Portugal', flag: '🇵🇹' },
  { value: 'PR', label: 'Puerto Rico', flag: '🇵🇷' },
  { value: 'QA', label: 'Qatar', flag: '🇶🇦' },
  { value: 'RE', label: 'Réunion', flag: '🇷🇪' },
  { value: 'RO', label: 'Romania', flag: '🇷🇴' },
  { value: 'RU', label: 'Russia', flag: '🇷🇺' },
  { value: 'RW', label: 'Rwanda', flag: '🇷🇼' },
  { value: 'BL', label: 'Saint Barthélemy', flag: '🇧🇱' },
  { value: 'SH', label: 'Saint Helena', flag: '🇸🇭' },
  { value: 'KN', label: 'Saint Kitts and Nevis', flag: '🇰🇳' },
  { value: 'LC', label: 'Saint Lucia', flag: '🇱🇨' },
  { value: 'MF', label: 'Saint Martin', flag: '🇲🇫' },
  { value: 'PM', label: 'Saint Pierre and Miquelon', flag: '🇵🇲' },
  { value: 'VC', label: 'Saint Vincent and the Grenadines', flag: '🇻🇨' },
  { value: 'WS', label: 'Samoa', flag: '🇼🇸' },
  { value: 'SM', label: 'San Marino', flag: '🇸🇲' },
  { value: 'ST', label: 'São Tomé and Príncipe', flag: '🇸🇹' },
  { value: 'SA', label: 'Saudi Arabia', flag: '🇸🇦' },
  { value: 'SN', label: 'Senegal', flag: '🇸🇳' },
  { value: 'RS', label: 'Serbia', flag: '🇷🇸' },
  { value: 'SC', label: 'Seychelles', flag: '🇸🇨' },
  { value: 'SL', label: 'Sierra Leone', flag: '🇸🇱' },
  { value: 'SG', label: 'Singapore', flag: '🇸🇬' },
  { value: 'SX', label: 'Sint Maarten', flag: '🇸🇽' },
  { value: 'SK', label: 'Slovakia', flag: '🇸🇰' },
  { value: 'SI', label: 'Slovenia', flag: '🇸🇮' },
  { value: 'SB', label: 'Solomon Islands', flag: '🇸🇧' },
  { value: 'SO', label: 'Somalia', flag: '🇸🇴' },
  { value: 'ZA', label: 'South Africa', flag: '🇿🇦' },
  { value: 'GS', label: 'South Georgia', flag: '🇬🇸' },
  { value: 'SS', label: 'South Sudan', flag: '🇸🇸' },
  { value: 'ES', label: 'Spain', flag: '🇪🇸' },
  { value: 'LK', label: 'Sri Lanka', flag: '🇱🇰' },
  { value: 'SD', label: 'Sudan', flag: '🇸🇩' },
  { value: 'SR', label: 'Suriname', flag: '🇸🇷' },
  { value: 'SJ', label: 'Svalbard and Jan Mayen', flag: '🇸🇯' },
  { value: 'SE', label: 'Sweden', flag: '🇸🇪' },
  { value: 'CH', label: 'Switzerland', flag: '🇨🇭' },
  { value: 'SY', label: 'Syria', flag: '🇸🇾' },
  { value: 'TW', label: 'Taiwan', flag: '🇹🇼' },
  { value: 'TJ', label: 'Tajikistan', flag: '🇹🇯' },
  { value: 'TZ', label: 'Tanzania', flag: '🇹🇿' },
  { value: 'TH', label: 'Thailand', flag: '🇹🇭' },
  { value: 'TL', label: 'Timor-Leste', flag: '🇹🇱' },
  { value: 'TG', label: 'Togo', flag: '🇹🇬' },
  { value: 'TK', label: 'Tokelau', flag: '🇹🇰' },
  { value: 'TO', label: 'Tonga', flag: '🇹🇴' },
  { value: 'TT', label: 'Trinidad and Tobago', flag: '🇹🇹' },
  { value: 'TN', label: 'Tunisia', flag: '🇹🇳' },
  { value: 'TR', label: 'Turkey', flag: '🇹🇷' },
  { value: 'TM', label: 'Turkmenistan', flag: '🇹🇲' },
  { value: 'TC', label: 'Turks and Caicos Islands', flag: '🇹🇨' },
  { value: 'TV', label: 'Tuvalu', flag: '🇹🇻' },
  { value: 'UG', label: 'Uganda', flag: '🇺🇬' },
  { value: 'UA', label: 'Ukraine', flag: '🇺🇦' },
  { value: 'AE', label: 'United Arab Emirates', flag: '🇦🇪' },
  { value: 'GB', label: 'United Kingdom', flag: '🇬🇧' },
  { value: 'US', label: 'United States', flag: '🇺🇸' },
  { value: 'UM', label: 'United States Minor Outlying Islands', flag: '🇺🇲' },
  { value: 'UY', label: 'Uruguay', flag: '🇺🇾' },
  { value: 'UZ', label: 'Uzbekistan', flag: '🇺🇿' },
  { value: 'VU', label: 'Vanuatu', flag: '🇻🇺' },
  { value: 'VE', label: 'Venezuela', flag: '🇻🇪' },
  { value: 'VN', label: 'Vietnam', flag: '🇻🇳' },
  { value: 'VG', label: 'Virgin Islands (British)', flag: '🇻🇬' },
  { value: 'VI', label: 'Virgin Islands (U.S.)', flag: '🇻🇮' },
  { value: 'WF', label: 'Wallis and Futuna', flag: '🇼🇫' },
  { value: 'EH', label: 'Western Sahara', flag: '🇪🇭' },
  { value: 'YE', label: 'Yemen', flag: '🇾🇪' },
  { value: 'ZM', label: 'Zambia', flag: '🇿🇲' },
  { value: 'ZW', label: 'Zimbabwe', flag: '🇿🇼' }
];

const CountryDropdown: React.FC<CountryDropdownProps> = ({
  value,
  onChange,
  className = '',
  error = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ 
    top: 0, 
    left: 0, 
    width: 0, 
    maxHeight: 200, 
    flipUp: false 
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const calculateDropdownPosition = () => {
    if (!buttonRef.current) return { top: 0, left: 0, width: 0, maxHeight: 200, flipUp: false };

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = Math.min(240, countries.length * 40);
    
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    const flipUp = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
    
    const maxHeight = flipUp ? Math.min(spaceAbove - 10, 240) : Math.min(spaceBelow - 10, 240);
    
    return {
      top: buttonRect.bottom,
      left: buttonRect.left,
      width: buttonRect.width,
      maxHeight,
      flipUp
    };
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (isOpen) {
        if (!buttonRef.current?.contains(target) && !dropdownRef.current?.contains(target)) {
          setIsOpen(false);
        }
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      const position = calculateDropdownPosition();
      setDropdownPosition(position);
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  const selectedCountry = countries.find(country => country.value === value);
  const displayValue = selectedCountry ? selectedCountry.label : 'Select a country';

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          ref={buttonRef}
          type="button"
          onClick={handleToggle}
          className={`w-full px-3 py-2 border rounded-md text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-between transition-colors bg-white cursor-pointer ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {selectedCountry?.flag && (
              <span className="text-sm">{selectedCountry.flag}</span>
            )}
            <span className={value ? 'text-gray-900' : 'text-gray-500'}>
              {displayValue}
            </span>
          </div>
          <ChevronDown 
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {isOpen && (
        <div 
          ref={dropdownRef}
          className="fixed z-[70] bg-white border border-gray-300 rounded-lg shadow-lg overflow-y-auto"
          style={{
            top: dropdownPosition.flipUp 
              ? dropdownPosition.top - dropdownPosition.maxHeight - 4
              : dropdownPosition.top + 4,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            maxHeight: dropdownPosition.maxHeight
          }}
        >
          {countries.map((country) => (
            <button
              key={country.value}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(country.value);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer first:rounded-t-lg last:rounded-b-lg ${
                value === country.value ? 'bg-indigo-50 text-indigo-600' : 'text-gray-900'
              }`}
            >
              {country.flag && (
                <span className="text-sm">{country.flag}</span>
              )}
              <span>{country.label}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default CountryDropdown;