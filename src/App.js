import React, { useState } from "react";
import { JsonForms } from "@jsonforms/react";
import {
  materialRenderers,
  materialCells,
} from "@jsonforms/material-renderers";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { coreReducer } from "@jsonforms/core";

// Schéma JSON
const schema = {
  type: "object",
  properties: {
    nom: {
      type: "string",
      title: "Nom",
    },
    paysPourcentages: {
      type: "array",
      title: "Pays et Pourcentages",
      items: {
        type: "object",
        properties: {
          pays: {
            type: "string",
            enum: ["France", "Belgique", "Allemagne", "Portugal", "Autre"],
          },
          pourcentage: {
            type: "number",
            minimum: 0,
            maximum: 100,
          },
        },
        required: ["pays", "pourcentage"],
      },
    },
  },
  required: ["nom", "paysPourcentages"],
};

// UI Schema
const uischema = {
  type: "VerticalLayout",
  elements: [
    {
      type: "Control",
      scope: "#/properties/nom",
    },
    {
      type: "Control",
      scope: "#/properties/paysPourcentages",
      options: {
        detail: {
          type: "HorizontalLayout",
          elements: [
            {
              type: "Control",
              scope: "#/properties/pays",
            },
            {
              type: "Control",
              scope: "#/properties/pourcentage",
            },
          ],
        },
      },
    },
  ],
};

// Initial State
const initialState = {
  jsonforms: {
    core: {
      data: {},
      schema: schema,
      uischema: uischema,
    },
  },
};

// Créer le store Redux en utilisant configureStore
const store = configureStore({
  reducer: coreReducer,
  preloadedState: initialState,
});

// Validation personnalisée
const validatePourcentages = (data) => {
  // Vérifiez si 'data' est défini
  if (!data) {
    return "Les données sont non définies";
  }

  // Vérifiez si 'paysPourcentages' est défini et est un tableau
  if (!data.paysPourcentages || !Array.isArray(data.paysPourcentages)) {
    return "Le tableau des pourcentages est vide ou non défini";
  }

  // Calculez la somme des pourcentages
  const total = data.paysPourcentages.reduce(
    (acc, item) => acc + (item.pourcentage || 0),
    0
  );

  // Retournez l'erreur si la somme n'est pas égale à 100
  return total === 100
    ? ""
    : "La somme des pourcentages doit être égale à 100%";
};

const FormulairePaysPourcentages = () => {
  const [validationError, setValidationError] = useState("");
  const [data, setData] = useState({});

  const handleValidation = ({ data }) => {
    const error = validatePourcentages(data);
    setData(data);
    setValidationError(error);
  };

  // Fonction pour rendre les données sous forme de liste
  const renderPaysPourcentages = (data) => {
    if (!data || !Array.isArray(data.paysPourcentages)) {
      return <p>Aucune donnée disponible.</p>;
    }

    return (
      <ul>
        {data.paysPourcentages.map((item, index) => (
          <li key={index}>
            {item.pays}: {item.pourcentage}%
          </li>
        ))}
      </ul>
    );
  };
  return (
    <>
      <Provider store={store}>
        <JsonForms
          schema={schema}
          uischema={uischema}
          renderers={materialRenderers}
          cells={materialCells}
          onChange={({ data }) => handleValidation({ data })} // Notez l'utilisation de { data }
        />
        {validationError && (
          <div style={{ color: "red" }}>{validationError}</div>
        )}
      </Provider>
      
      
      <div>{renderPaysPourcentages(data)}</div>
    </>
  );
};

export default FormulairePaysPourcentages;
