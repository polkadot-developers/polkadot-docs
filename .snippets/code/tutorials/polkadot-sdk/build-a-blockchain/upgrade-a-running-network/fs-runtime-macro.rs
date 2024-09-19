// Create the runtime by composing the FRAME pallets that were previously configured.
#[frame_support::runtime]
mod runtime {
    ...
    // Include the custom logic from the pallet-template in the runtime.
    #[runtime::pallet_index(7)]
    pub type TemplateModule = pallet_template;

    #[runtime::pallet_index(8)]
    pub type Utility = pallet_utility;
    ...
}