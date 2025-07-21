import React, { useState, useEffect, useRef } from 'react';

const GoogleMapsPicker = ({ onLocationSelect, initialAddress, initialLocation }) => {
  const mapRef = useRef(null);
  const searchBoxRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState(initialAddress || '');
  const [location, setLocation] = useState(initialLocation || { lat: -6.2088, lng: 106.8456 }); // Default to Jakarta
  const [requestCount, setRequestCount] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: location,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    // Create marker
    const markerInstance = new window.google.maps.Marker({
      position: location,
      map: mapInstance,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
    });

    // Add marker drag event
    markerInstance.addListener('dragend', () => {
      if (isLimitReached) return;
      const position = markerInstance.getPosition();
      const newLocation = {
        lat: position.lat(),
        lng: position.lng()
      };
      setLocation(newLocation);
      getAddressFromLatLng(newLocation);
      onLocationSelect({
        address,
        location: newLocation
      });
    });

    // Initialize search box
    const searchBoxInstance = new window.google.maps.places.SearchBox(searchBoxRef.current);
    mapInstance.controls[window.google.maps.ControlPosition.TOP_CENTER].push(searchBoxRef.current);

    // Add search box event
    searchBoxInstance.addListener('places_changed', () => {
      if (isLimitReached) return;
      incrementRequestCount();
      const places = searchBoxInstance.getPlaces();
      if (places.length === 0) return;
      const place = places[0];
      if (!place.geometry || !place.geometry.location) return;
      // Update map and marker
      mapInstance.setCenter(place.geometry.location);
      markerInstance.setPosition(place.geometry.location);
      // Update state
      const newLocation = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };
      setLocation(newLocation);
      setAddress(place.formatted_address);
      onLocationSelect({
        address: place.formatted_address,
        location: newLocation
      });
    });

    setMap(mapInstance);
    setMarker(markerInstance);

    // If we have an initial address but no location, try to geocode it
    if (initialAddress && !initialLocation) {
      geocodeAddress(initialAddress, mapInstance, markerInstance);
    }

    return () => {
      // Cleanup
      if (markerInstance) {
        window.google.maps.event.clearInstanceListeners(markerInstance);
      }
      if (searchBoxInstance) {
        window.google.maps.event.clearInstanceListeners(searchBoxInstance);
      }
    };
  }, []);

  // Fungsi untuk menambah request count dan cek limit
  const incrementRequestCount = () => {
    setRequestCount((prev) => {
      if (prev + 1 >= 300) {
        setIsLimitReached(true);
        return 300;
      }
      return prev + 1;
    });
  };

  // Function to get address from lat/lng
  const getAddressFromLatLng = (latLng) => {
    if (isLimitReached) return;
    incrementRequestCount();
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setAddress(results[0].formatted_address);
        onLocationSelect({
          address: results[0].formatted_address,
          location: latLng
        });
      }
    });
  };

  // Function to geocode an address
  const geocodeAddress = (address, mapInstance, markerInstance) => {
    if (isLimitReached) return;
    incrementRequestCount();
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        mapInstance.setCenter(location);
        markerInstance.setPosition(location);
        const newLocation = {
          lat: location.lat(),
          lng: location.lng()
        };
        setLocation(newLocation);
        onLocationSelect({
          address,
          location: newLocation
        });
      }
    });
  };

  // Handle address input change
  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  // Handle address search
  const handleAddressSearch = (e) => {
    e.preventDefault();
    if (!address || isLimitReached) return;
    if (map && marker) {
      geocodeAddress(address, map, marker);
    }
  };

  return (
    <div className="google-maps-picker">
      <div className="mb-3">
        <form onSubmit={handleAddressSearch} className="flex">
          <input
            ref={searchBoxRef}
            type="text"
            value={address}
            onChange={handleAddressChange}
            placeholder="Cari alamat atau geser pin pada peta"
            className="w-full px-3 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-green-300"
            disabled={isLimitReached}
          />
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded-r hover:bg-green-600"
            disabled={isLimitReached}
          >
            Cari
          </button>
        </form>
        {isLimitReached && (
          <div className="text-red-500 text-sm mt-2">Batas request Google Maps telah tercapai (300). Silakan refresh halaman untuk melanjutkan.</div>
        )}
      </div>
      <div 
        ref={mapRef} 
        className="w-full h-64 rounded-lg border border-gray-300"
        style={isLimitReached ? { pointerEvents: 'none', opacity: 0.6 } : {}}
      ></div>
      <p className="text-xs text-gray-500 mt-2">
        Geser pin untuk menyesuaikan lokasi dengan tepat
      </p>
      <p className="text-xs text-gray-400 mt-1">Request Maps: {requestCount} / 300</p>
    </div>
  );
};

export default GoogleMapsPicker; 