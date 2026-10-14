/**
 * University Maintenance Monitoring and Management Platform
 * Maintenance Categories and Subcategories Configuration Module
 * 
 * Defines main categories, category weights (CW: 3-10),
 * subcategories, and subcategory weights (SW: 1-5).
 */

const maintenanceConfig = {
  Electricity: {
    weight: 10,
    subcategories: {
      "Electrical Panels": 5,
      "Power Supply": 5,
      "Wiring & Cables": 5,
      "Switches & Sockets": 4,
      "Ceiling Fans": 3,
      "Lighting & Fixtures": 2
    }
  },
  Water: {
    weight: 9,
    subcategories: {
      "Water Pumps": 5,
      "Water Supply": 5,
      "Pipelines & Leaks": 4,
      "Toilets & Flushing": 4,
      "Drainage & Overflow": 4,
      "Taps & Valves": 3
    }
  },
  "Civil & Structural": {
    weight: 8,
    subcategories: {
      "Structural Damage": 5,
      "Ceilings & Roofs": 5,
      "Elevator": 5,
      "Walls & Plaster": 3,
      "Flooring & Tiles": 3,
      "Doors & Windows": 3,
      "Furniture & Desks": 2
    }
  },
  HVAC: {
    weight: 7,
    subcategories: {
      "Chiller Systems": 5,
      "Air Conditioning Unit": 4,
      "Duct Ventilation": 4,
      "Exhaust Fans": 3,
      "Thermostat Control": 2,
      "Filter Replacement": 2
    }
  },
  Academic: {
    weight: 5,
    subcategories: {
      "Laboratory Equipment": 5,
      "Classroom Equipment": 4,
      "Projectors & Displays": 3,
      "Whiteboards": 2,
      "Academic Furniture": 2
    }
  },
  Cleaning: {
    weight: 4,
    subcategories: {
      "Hazardous Spill": 5,
      "Toilet & Sanitation": 4,
      "Waste Management": 4,
      "Classroom Cleaning": 3,
      "Corridor Cleaning": 2,
      "General Cleaning": 1
    }
  },
  Gardening: {
    weight: 3,
    subcategories: {
      "Fallen/Dangerous Tree": 5,
      "Dangerous Branches": 5,
      "Drainage/Vegetation Obstruction": 4,
      "Tree Maintenance": 3,
      "Grass Cutting": 2,
      "General Landscaping": 1
    }
  }
};

module.exports = maintenanceConfig;
