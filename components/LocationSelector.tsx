import React, { useEffect, useState } from 'react';
import { BANGLADESH_LOCATIONS } from '../constants';
import { LocationHierarchy } from '../types';
import { Select, Input, Button } from './ui';
import { MapPin } from 'lucide-react';

interface LocationSelectorProps {
  value: LocationHierarchy;
  onChange: (loc: LocationHierarchy) => void;
  allowAutoDetect?: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({ value, onChange, allowAutoDetect = true }) => {
  const [districts, setDistricts] = useState<string[]>([]);
  const [upazilas, setUpazilas] = useState<string[]>([]);
  const [loadingGeo, setLoadingGeo] = useState(false);

  // Update dropdown options when parent selection changes
  useEffect(() => {
    if (value.division && BANGLADESH_LOCATIONS[value.division]) {
      setDistricts(Object.keys(BANGLADESH_LOCATIONS[value.division]));
    } else {
      setDistricts([]);
      setUpazilas([]);
    }
  }, [value.division]);

  useEffect(() => {
    if (value.division && value.district && BANGLADESH_LOCATIONS[value.division]?.[value.district]) {
      setUpazilas(BANGLADESH_LOCATIONS[value.division][value.district]);
    } else {
      setUpazilas([]);
    }
  }, [value.district, value.division]);

  const handleAutoDetect = () => {
    setLoadingGeo(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          // In a real app, we would reverse geocode (lat, lng) to Div/Dist/Upa.
          // For this demo, we'll simulate finding "Dhaka/Dhaka/Mirpur".
          setTimeout(() => {
             onChange({
                division: 'Dhaka',
                district: 'Dhaka',
                upazila: 'Mirpur',
                village: ''
             });
             setLoadingGeo(false);
          }, 1000);
        },
        (error) => {
          console.error("Geo error", error);
          alert("Could not detect location. Please select manually.");
          setLoadingGeo(false);
        }
      );
    } else {
      alert("Geolocation not supported.");
      setLoadingGeo(false);
    }
  };

  return (
    <div className="space-y-3">
      {allowAutoDetect && (
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Select Location</h3>
            <Button variant="ghost" className="text-sm py-1 h-auto" onClick={handleAutoDetect} loading={loadingGeo}>
                <MapPin className="w-3 h-3 mr-1" />
                Auto-Detect
            </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Select 
          value={value.division} 
          onChange={(e) => onChange({ ...value, division: e.target.value, district: '', upazila: '' })}
        >
          <option value="">Select Division</option>
          {Object.keys(BANGLADESH_LOCATIONS).map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </Select>

        <Select 
          value={value.district} 
          disabled={!value.division}
          onChange={(e) => onChange({ ...value, district: e.target.value, upazila: '' })}
        >
          <option value="">Select District</option>
          {districts.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </Select>

        <Select 
          value={value.upazila} 
          disabled={!value.district}
          onChange={(e) => onChange({ ...value, upazila: e.target.value })}
        >
          <option value="">Select Upazila</option>
          {upazilas.map(u => (
            <option key={u} value={u}>{u}</option>
          ))}
        </Select>
        
        <Input 
            placeholder="Village/Area (Optional)"
            value={value.village}
            onChange={(e) => onChange({...value, village: e.target.value})}
        />
      </div>
    </div>
  );
};
