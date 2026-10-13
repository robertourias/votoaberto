import { render, screen } from "@testing-library/react";

import Home from "./page";

describe("Home", () => {
  it("exibe o nome do produto como h1", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { level: 1, name: "VotoAberto" }),
    ).toBeInTheDocument();
  });

  it("exibe a tagline do produto", () => {
    render(<Home />);
    expect(
      screen.getByText(
        "Entenda como o poder funciona no Brasil e veja, com dados oficiais, o que cada parlamentar fez.",
      ),
    ).toBeInTheDocument();
  });
});
