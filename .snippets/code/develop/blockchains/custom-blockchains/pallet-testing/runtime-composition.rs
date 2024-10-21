frame_support::construct_runtime!(
    pub enum Test {
        System: frame_system,
        TemplateModule: pallet_template,
    }
);