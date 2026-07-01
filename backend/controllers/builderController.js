import { db } from '../db.js';

export async function getBuilderData(req, res) {
  try {
    const data = await db.getBuilderData(req.userId);
    
    // Return empty defaults if no saved profile exists yet
    if (!data) {
      return res.status(200).json({
        name: '',
        title: '',
        email: '',
        phone: '',
        website: '',
        summary: '',
        experience: [],
        education: [],
        skills: [],
        projects: [],
        selectedTemplate: 'modern'
      });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Get builder data error:', error);
    res.status(500).json({ error: 'Server error retrieving resume builder details.' });
  }
}

export async function saveBuilderData(req, res) {
  try {
    const { 
      name, title, email, phone, website, summary, 
      experience, education, skills, projects, selectedTemplate 
    } = req.body;

    const builderData = {
      name: name || '',
      title: title || '',
      email: email || '',
      phone: phone || '',
      website: website || '',
      summary: summary || '',
      experience: experience || [],
      education: education || [],
      skills: skills || [],
      projects: projects || [],
      selectedTemplate: selectedTemplate || 'modern'
    };

    console.log(`Saving resume builder details for user: ${req.userId}...`);
    const savedData = await db.saveBuilderData(req.userId, builderData);

    res.status(200).json(savedData);
  } catch (error) {
    console.error('Save builder data error:', error);
    res.status(500).json({ error: 'Server error saving resume builder details.' });
  }
}
