import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { ResumeData } from '@/types';

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' },
  ],
});

const createStyles = (colors: { primary: string; secondary: string; background: string; text: string }) =>
  StyleSheet.create({
    page: {
      padding: 40,
      fontFamily: 'Helvetica',
      color: colors.text,
    },
    header: {
      marginBottom: 20,
      paddingBottom: 15,
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
      alignItems: 'center',
    },
    name: {
      fontSize: 24,
      fontFamily: 'Helvetica-Bold',
      color: colors.primary,
      marginBottom: 5,
    },
    headline: {
      fontSize: 12,
      color: colors.secondary,
      marginBottom: 5,
    },
    location: {
      fontSize: 10,
      color: colors.secondary,
    },
    contact: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 15,
      marginTop: 8,
      fontSize: 9,
      color: colors.secondary,
    },
    section: {
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 14,
      fontFamily: 'Helvetica-Bold',
      color: colors.primary,
      borderBottomWidth: 1,
      borderBottomColor: colors.secondary,
      paddingBottom: 3,
      marginBottom: 10,
    },
    experienceItem: {
      marginBottom: 12,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 3,
    },
    itemTitle: {
      fontSize: 11,
      fontWeight: 'bold',
    },
    itemDate: {
      fontSize: 9,
      color: colors.secondary,
    },
    itemCompany: {
      fontSize: 10,
      color: colors.primary,
      fontWeight: 500,
    },
    itemLocation: {
      fontSize: 9,
      color: colors.secondary,
    },
    itemDescription: {
      fontSize: 10,
      marginTop: 3,
      lineHeight: 1.5,
    },
    summary: {
      fontSize: 10,
      lineHeight: 1.5,
    },
    skillsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    skill: {
      backgroundColor: `${colors.primary}15`,
      color: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
      fontSize: 9,
    },
  });

interface ResumeDocumentProps {
  data: ResumeData;
}

export function ResumeDocument({ data }: ResumeDocumentProps) {
  const { profile, template, options } = data;
  const colors = {
    primary: options?.colors?.primary || template.config.colors.primary,
    secondary: options?.colors?.secondary || template.config.colors.secondary,
    background: options?.colors?.background || template.config.colors.background,
    text: options?.colors?.text || template.config.colors.text,
  };
  const styles = createStyles(colors);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{profile.fullName}</Text>
          <Text style={styles.headline}>{profile.headline}</Text>
          {profile.location && <Text style={styles.location}>{profile.location}</Text>}
          <View style={styles.contact}>
            {profile.email && <Text>{profile.email}</Text>}
            {profile.phone && <Text>{profile.phone}</Text>}
            <Text>LinkedIn</Text>
          </View>
        </View>

        {profile.summary && options?.sections?.exclude?.includes('summary') !== true && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{profile.summary}</Text>
          </View>
        )}

        {profile.experiences.length > 0 && options?.sections?.exclude?.includes('experience') !== true && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {profile.experiences.map((exp) => (
              <View key={exp.id} style={styles.experienceItem}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{exp.title}</Text>
                  <Text style={styles.itemDate}>
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate || 'Present'}
                  </Text>
                </View>
                <Text style={styles.itemCompany}>{exp.company}</Text>
                {exp.location && <Text style={styles.itemLocation}>{exp.location}</Text>}
                <Text style={styles.itemDescription}>{exp.description}</Text>
              </View>
            ))}
          </View>
        )}

        {profile.education.length > 0 && options?.sections?.exclude?.includes('education') !== true && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {profile.education.map((edu) => (
              <View key={edu.id} style={styles.experienceItem}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>
                    {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                  </Text>
                  <Text style={styles.itemDate}>{edu.startDate} - {edu.endDate}</Text>
                </View>
                <Text style={styles.itemCompany}>{edu.school}</Text>
              </View>
            ))}
          </View>
        )}

        {profile.skills.length > 0 && options?.sections?.exclude?.includes('skills') !== true && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
              {profile.skills.map((skill) => (
                <Text key={skill.id} style={styles.skill}>{skill.name}</Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}

export function generatePdfBlob(data: ResumeData): Blob {
  const { profile, template, options } = data;
  const colors = options?.colors || template.config.colors;
  const fonts = options?.fonts || template.config.fonts;
  
  const doc = (
    <ResumeDocument data={data} />
  );

  return doc as unknown as Blob;
}
