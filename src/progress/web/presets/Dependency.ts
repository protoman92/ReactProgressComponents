import { Try } from "javascriptutilities";

export namespace Style {
  /**
   * Represents common styles for progress display component presets.
   */
  export interface Type {
    progressItemColor: string;
  }

  /**
   * Provide style for progress display component presets.
   */
  export interface ProviderType {
    progressDisplayPreset: Type;
  }

  /**
   * Create a default style for progress display component presets.
   * @returns {Type} A Type instance.
   */
  export let createDefault = (): Type => ({ progressItemColor: 'black' });
}

export namespace Provider {
  /**
   * Provide the necessary dependencies for progress display component presets.
   */
  export interface Type {
    style?: Style.ProviderType;
  }
}

export namespace ViewModel {
  /**
   * View model for progress display component presets.
   */
  export interface Type {
    style: Style.Type;
  }

  /**
   * Provide view model for progress display component presets.
   */
  export interface ProviderType {
    progressDisplayPreset_viewModel(): Type;
  }

  /**
   * View model for progress display component presets.
   * @implements {Type} Type implementation.
   */
  export class Self implements Type {
    private readonly provider: Provider.Type;

    public get style(): Style.Type {
      return Try.unwrap(this.provider.style)
        .map(v => v.progressDisplayPreset)
        .getOrElse(Style.createDefault());
    }

    public constructor(provider: Provider.Type) {
      this.provider = provider;
    }
  }
}

export namespace Props {
  /**
   * Props type for progress display component presets.
   */
  export interface Type {
    viewModel: ViewModel.Type;
  }
}