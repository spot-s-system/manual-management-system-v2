"use client";

import { cn } from "@/lib/utils";
import Box from "@mui/material/Box";
import Step from "@mui/material/Step";
import StepContent from "@mui/material/StepContent";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import type { ReactNode } from "react";

interface StepperProps {
  steps: {
    id: string;
    title: string;
    description?: string;
    content?: ReactNode;
  }[];
  className?: string;
}

export function VerticalStepper({ steps, className }: StepperProps) {
  const iconSize = "3rem"; // アイコンサイズを変数として定義

  return (
    <Box className={cn("w-full", className)}>
      <Stepper
        activeStep={-1}
        orientation="vertical"
        sx={{
          "& .MuiStepConnector-root": {
            marginLeft: "1.5rem",
            "& .MuiStepConnector-line": {
              marginLeft: "-1px", // 微調整
            },
          },
          "& .MuiStep-root": {
            paddingLeft: 0,
            "&:first-of-type": {
              marginTop: "8px", // 最初のステップに上マージンを追加
            },
            "&:last-of-type": {
              marginBottom: "8px", // 最後のステップに下マージンを追加
            },
          },
        }}
      >
        {steps.map((step) => (
          <Step key={step.id} expanded={true} id={step.id}>
            <StepLabel
              sx={{
                "& .MuiStepLabel-label": {
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  marginLeft: "8px",
                },
                "& .MuiStepIcon-root": {
                  color: "#2563eb",
                  fontSize: iconSize,
                  marginRight: 0,
                },
                "& .MuiStepLabel-iconContainer": {
                  paddingRight: 0,
                },
              }}
            >
              {step.title}
            </StepLabel>
            <StepContent
              sx={{
                marginLeft: `calc(${iconSize} / 2)`, // 丸の半径に合わせる
                paddingLeft: "2rem",
                paddingBottom: "16px",
              }}
            >
              {step.description && (
                <p className="text-sm text-gray-500 mt-1 mb-4">{step.description}</p>
              )}
              {step.content && <div className="mt-2">{step.content}</div>}
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
